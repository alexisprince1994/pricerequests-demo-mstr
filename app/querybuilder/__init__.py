from flask import Flask, request
from app import db

# app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db = SQLAlchemy(app)

class QueryError(Exception):

	status_code = 400

	def __init__(self, *args, status_code=None, **kwargs):
		"""
		Creates a specific exception to be raised if a bad get request
		is sent (missing column, bad operator).
		:param message: str, message to return to use
		:param payload: dict
		:param status_code: int, status code returned to user.

		"""
		
		super().__init__(self, *args, **kwargs)
		self.status_code = status_code or QueryError.status_code

class QueryBuilder(object):


	def __init__(self, query, operator_mapping):
		"""
		Constructor for a querybuilder object. Gets the associated model class
		:param query: sqlalchemy query object
		"""
		self.query = query
		self.model_class = self._get_class_from_query()
		self.operator_mapping = {value.lower(): key for key, value in operator_mapping.items()}

	def _get_class_from_query(self):

		"""
		Parses the model associated with a query. Taken from the
		sqlalchemy documentation.
		I placed the len(exprs) == 1 to ensure there are
		no multi-table queries present for this.
		Mult-table queries will add significant complexity that
		can be addressed at a future date :)
		"""

		exprs = [
			d['expr']
			if isinstance(d['expr'], db.Column)
			else d['entity']
			for d in self.query.column_descriptions
		]
		
		assert len(exprs) == 1, 'Single table queries only!'
		return exprs[0]

	def filter_query(self, request, sep=';'):

		"""
		Applies filters based on a get request. Returns errors if the
		get request is incomplete.

		:param request: flask request
		:param sep: str, separator of column, operator, value from the query

		"""

		# Bailing early if there are no filters to apply
		# This indicates the user hit the find button
		# without applying filters.

		if 'filter[]' not in request.args:
			return self.query
		

		raw_filters = request.args.getlist('filter[]')

		if raw_filters == ['all']:
			return self.query


		for raw_filter in raw_filters:
			
			try:
				col, op_description, raw_val = raw_filter.split(sep)

				# The boolean values come through as strings
				# which is super annoying.
				if raw_val == 'true':
					val = True
				elif raw_val == 'false':
					val = False
				else:
					val = raw_val
				try:
					op = self.operator_mapping[op_description.lower()]
				except KeyError as e:
					raise QueryError("Invalid filter: {}".format(op_description), status_code=400)	
				
			except ValueError as e:
				raise QueryError("Invalid filter: {}".format( raw_filter), 
						status_code=400)
			
			column = getattr(self.model_class, col, None)
			if not column:
				raise QueryError("Invalid filter column: {}".format(col),
					status_code=400)

			if op == 'in':
				# Making sure to strip the white space because users will often
				# enter values like "Val1, Val2" by force of habit.
				filt = column.in_([clean_val.strip() for clean_val in val.split(',')])
			elif op.lower() == 'is null':
				filt = column.is_(None)
			elif op.lower() == "is not null":
				filt = column.isnot(None)
			else:
				try:
					attr = list(filter(
						lambda e: hasattr(column, e % op),
						['%s', '%s_', '__%s__']))[0] % op
				except IndexError:
					raise QueryError("Invalid query operator: {}".format(op),
						status_code=400)
					print('Index error in filter operator: {}'.format(op))
				if val == 'null':
					val = None
				filt = getattr(column, attr)(val)
			self.query = self.query.filter(filt)

		return self.query
