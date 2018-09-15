from sqlalchemy.exc import IntegrityError
import datetime


class ClientServerException(Exception):
	"""
	Raise when the data submitted for the server has a different
	last updated datetime than the record in the server.
	This will ensure that two users unknowingly write over
	each other's changes if they're editing concurrently.
	"""
	pass

class EditReference(object):

	"""
	Creates an editref processor for processing user changes to tables served
	with the datatables class.

	TO DO
	GENERALIZE THIS TO ACCOMODATE SUBCLASSING FOR MASS UPDATING FEATURE.
	"""

	def __init__(self, db, client_data, request_method, table=None, system_columns=None,
			editable_columns=None, columns=None, compare_ludate=True, 
			allowed_request_methods=None, pk=None, requesting_username=None):

		self.table = table
		if pk is not None:
			self.pk = pk
		else:
			pk = self.table.__table__.primary_key.columns.keys()
			assert len(pk) == 1, "Tables with multiple column primary keys are not supported"
			self.pk = pk[0]
		
		self.db = db
		self.client_data = client_data
		self.request_method = request_method
		self.system_columns = system_columns
		self.editable_columns = editable_columns
		self.columns = columns
		self.compare_ludate = compare_ludate

		self.requesting_username = requesting_username

		if allowed_request_methods is None:
			self.allowed_request_methods = ['GET', 'POST', 'PUT', 'DELETE']
		else:
			self.allowed_request_methods = allowed_request_methods
		

		# Transformers run before trying to modify the database.
		self.transformers = {}

	@classmethod
	def from_sqlalchemy(cls, model, *args, **kwargs):
		system_columns = model.system_columns
		editable_columns = model.editable_columns
		columns = [col for col in model.__table__.columns.keys()]
		return cls(*args, system_columns=system_columns, editable_columns=editable_columns,
			columns=columns, **kwags)
		
	def sqlalchemy_converter(self, instance, timestamp_columns=None, column_exclusions=None):
		"""
		:param instance: list, list of model objects
		:param timestamp_columns: list, list of column names (as strings) 
			that will be converted to unix timestamps.
		:param column_exclusions: list, list of column names (as strings) 
			that will not be converted for serialization.
		"""

		all_columns = self.columns
		if column_exclusions:
			columns = [col for col in all_columns if col not in column_exclusions]
		else:
			columns = all_columns

		data_dict = {}
		for col in columns:
			if timestamp_columns:
				if col in timestamp_columns:
					data_dict[str(col)] = (getattr(instance, col)  - datetime.datetime(1970, 1, 1)).total_seconds()
				else:
					data_dict[str(col)] = getattr(instance, col)
			else:
				data_dict[str(col)] = getattr(instance, col)

		return data_dict

	def _confirm_column_exists(self, column):
		"""
		:param column: string.
		Checks to confirm the column provided is in the list of columns for the editref.
		If not, raise value error.
		"""
		if column not in self.columns:
			raise ValueError('{} is not a column. Unable to add transformer for column that doesnt exist.'.format(column))

	def _transform_data(self, client_record):

		"""
		Applies all stored transforms (if they exist) to the
		record passed through.
		:param client_record: dict
		return: dict
		"""

		transformed_client_record = client_record
		transformers = self.transformers.get(self.request_method.upper())
		
		# transformers should be a dict of {column: [transformers]}

		if transformers is None or len(transformers) == 0:
			return client_record

		
		for column, transformer_list in transformers.items():
			if len(transformer_list) == 0:
				continue
			old_attr = transformed_client_record[column]	#getattr(transformed_client_record, column)

			for transformer in transformer_list:
				new_attr = transformer(old_attr)
			
			transformed_client_record[column] = new_attr
			# setattr(transformed_client_record, column, new_attr)

		return transformed_client_record

	def add_transformer(self, request_methods, column, transformer):
		"""
		Adds a function to the Edit Reference's transformer dictionary.
		Calls this function on each record passed through the Edit Reference
		class in the order they are added to the class.
		"""

		assert isinstance(request_methods, list), 'request_methods must be a list.'
		assert isinstance(column, str), 'column argument should be a string.'

		for request_method in request_methods:
			caps_req_method = request_method.upper()

			if callable(transformer) and caps_req_method in self.allowed_request_methods:
				self._confirm_column_exists(column)
				existing_transformers = self.transformers.get(caps_req_method)
				# If no transformers have been added for the request method yet
				if existing_transformers is None:
					self.transformers[caps_req_method] = {column: [transformer]}
					continue

				# If a transformer has been added for the request method, but not 
				# this specific column.
				column_tranformers = existing_transformers.get(column)
				if column_tranformers is None:
					self.transformers[caps_req_method][column] = [transformer]
					continue

				# Otherwise, just append it to the list.
				self.transformers[caps_req_method][column].append(transformer)
				continue

			if not callable(transformer):
				raise ValueError('Transformer must be callable.')

			if caps_req_method not in self.allowed_request_methods:
				raise ValueError('Trying to transform an unsupported request method for this table.')

	def post_validator(self, server_instance):
		"""
		Business/application logic for each record to be posted.
		If no logic other than database constraints, subclass.
		"""
		return True, None

	def put_validator(self, server_instance):
		"""
		Business/application logic for each record to be put.
		If no logic other than database constraints, subclass.
		"""
		return True, None

	def delete_validator(self, server_instance):
		"""
		Business/application logic for each record to be deleted.
		If no logic other than database constraints, subclass.
		"""
		return True, None

	def process(self):
		if self.request_method == 'POST':
			return self.post()
		elif self.request_method == 'DELETE':
			return self.delete()
		elif self.request_method == 'PUT':
			return self.put()
		
	def post(self):
		response = []
		for client_row in self.client_data:
			client_record = {}
			client_record['dt_index'] = client_row.pop('dt_index')
			try:
				server_instance = self.table(**client_row)

				for column in self.system_columns:
					setattr(server_instance, column, None)

				client_row = self._transform_data(client_row)

				# Makes sure to transform the data before interacting
				# with the server instance.
				for col in self.editable_columns:
					setattr(server_instance, col, client_row[col])

				server_instance.crusername = self.requesting_username
				server_instance.luusername = self.requesting_username

				validated, error = self.post_validator(server_instance)
				if not validated:
					client_record['client_data'] = client_row
					client_record['modified_ok'] = False
					client_record['error'] = error
					yield client_record
					continue
					
				self.db.session.add(server_instance)
				self.db.session.commit()
				client_record['server_data'] = self.sqlalchemy_converter(server_instance, timestamp_columns=['crdate', 'ludate'])
				client_record['modified_ok'] = True
				yield client_record
				continue
			except IntegrityError as e:
				self.db.session.rollback()
				client_record['modified_ok'] = False
				client_record['client_data'] = client_row
				if 'UNIQUE CONSTRAINT' in str(e).upper():
					client_record['error'] = "{}. {} already exists or is not allowed".format(e.args, e.params)
				elif 'NOT NULL' in str(e).upper():
					client_record['error'] = e.args
				else:
					client_record['error'] = str(e)

				yield client_record
				continue

			except Exception as e:
				self.db.session.rollback()
				client_record['error'] = str(e)
				client_record['client_data'] = client_row
				client_record['modified_ok'] = False
				yield client_record
				continue

	def confirm_instance_exists(self, client_row):
		# What if pk doesn't exist? They shouldnt be able to send a request
		# without that piece of info...
		# but what if they do?

		pk_value = client_row[self.pk]
		instance = self.table.query.get(pk_value)
		
		if instance is None:
			raise ClientServerException("Unable to find {} {} in the database".
				format(self.pk, pk_value))

		return instance

	@staticmethod
	def compare_lastupdates(client_row, server_instance):
		
		client_ludate = client_row['ludate']
		server_ludate = (server_instance.ludate - datetime.datetime(1970, 1, 1)).total_seconds()
		if int(client_ludate) != int(server_ludate):
			raise ClientServerException("This row is out of sync with the server. Please reload the page.")
		return

	def put(self):

		response = []

		for client_row in self.client_data:
			client_record = {'dt_index': client_row.pop('dt_index', None)}

			try:
				server_instance = self.confirm_instance_exists(client_row)
			except ClientServerException as e:
				client_record['error'] = str(e)
				client_record['modified_ok'] = False
				client_record['client_data'] = client_row
				yield client_record
				continue

			# Comparing updates because we don't need to transform something
			# that we know is going to get thrown back as an error anyway.
			if self.compare_ludate:
				try:
					self.compare_lastupdates(client_row, server_instance)
				except ClientServerException as e:
					client_record['error'] = str(e)
					client_record['modified_ok'] = False
					client_record['client_data'] = client_row
					yield client_record
					continue

			#transformed_server_instance = self._transform_data(server_instance)
			client_row = self._transform_data(client_row)

			# Making sure to do validations and transformations before 
			# interacting with the database.
			for col in self.editable_columns:
				# Making sure values aren't equal before issuing updates.
				if getattr(server_instance, col) != client_row[col]:
					setattr(server_instance, col, client_row[col])

			server_instance.luusername = self.requesting_username

			validated, error = self.put_validator(server_instance)
			if not validated:
				client_record['client_data'] = client_row
				client_record['modified_ok'] = False
				client_record['error'] = error
				yield client_record
				continue

			try:
				
				self.db.session.add(server_instance)
				self.db.session.commit()
				client_record['server_data'] = self.sqlalchemy_converter(server_instance, timestamp_columns=['crdate', 'ludate'])
				client_record['modified_ok'] = True
				yield client_record
			except IntegrityError as e:
				self.db.session.rollback()
				client_record['modified_ok'] = False

				if 'UNIQUE CONSTRAINT' in str(e).upper():
					client_record['error'] = "{}. {} already exists or is not allowed".format(e.args, e.params)
				elif 'NOT NULL' in str(e).upper():
					client_record['error'] = e.args
				else:
					client_record['error'] = str(e)

				yield client_record

			except Exception as e:
				self.db.session.rollback()
				client_record['error'] = str(e)
				client_record['modified_ok'] = False
				yield client_record


	def delete(self):

		for client_row in self.client_data:
			client_record = {'dt_index': client_row.pop('dt_index', None)}

			try:
				server_instance = self.confirm_instance_exists(client_row)
			except ClientServerException as e:
				client_record['error'] = str(e)
				client_record['modified_ok'] = False
				yield client_record
				# If a record makes it here, that means it doesn't exist anymore.
				# So we go to the next client record instead of resuming state.
				continue

			if self.compare_ludate:
				try:
					self.compare_lastupdates(client_row, server_instance)
				except ClientServerException as e:
					client_record['error'] = str(e)
					client_record['modified_ok'] = False
					yield client_record
					# If we make it here, that means it exists but has a different ludate
					# So we go to next client record.
					continue

			validated, error = self.delete_validator(server_instance)
			if not validated:
				client_record['client_data'] = self.client_row
				client_record['modified_ok'] = False
				client_record['error'] = error
				yield client_record

			try:
				# Builds a dynamic query that allows for deleting.
				# Deleting using self.db.session.delete(server_instance)
				# seems unreliable. It was issuing an update statement
				# for a row that no longer existed.
				pk_value = client_row[self.pk]
				sqlalchemy_column = getattr(self.table, self.pk)
				# Builds a filter to get the object where the primary key
				# is equal (__eq__) to the value passed by client.
				filt = getattr(sqlalchemy_column, '__eq__')(pk_value)
				self.table.query.filter(filt).delete()
				self.db.session.commit()
				client_record['modified_ok'] = True
				yield client_record
			except Exception as e:
				client_record['error'] = str(e)
				client_record['modified_ok'] = False
				self.db.session.rollback()
				yield client_record
