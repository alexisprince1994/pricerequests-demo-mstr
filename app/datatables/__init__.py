from collections import OrderedDict
from sqlalchemy.sql.sqltypes import BOOLEAN, INTEGER


class DataTableColumn(object):

	"""
	Creates the required column attributes
	to instantiate a column with config options
	in the data table extension for jquery.

	"""

	special_dtypes = {'BOOLEAN': 'bool', 'DATETIME': 'timestamp'}


	def __init__(self, name, order, dtype, label=None, editable=True, 
		sortable=True, is_unique_id=False, defaultContent=''):

		self.name = name
		self.data = self.name
		self.order = order
		self.label = label
		self.sortable = sortable
		self.editable = editable
		self.is_unique_id = is_unique_id

		# Created by default parse dtypes
		self.defaultContent = None
		self.dtype = None

		self._parse_dtype(dtype, defaultContent)

	def __repr__(self):
		return '<DataTableColumn {}>'.format(self.__dict__)

	def __str__(self):
		return 'DataTableColumn {} ordered {}'.format(self.name, self.order)

	def _parse_dtype(self, dtype, defaultContent):

		_dtype = str(dtype).lower()
		
		if _dtype == 'bool' or _dtype == 'boolean':
		# Editing property doesn't apply to boolean fields.
		# Bools get displayed as true/false checkboxes instead
		# of allowing the user to directly edit the datatable.
			
			if defaultContent not in [True, False]:
				error_str = "dtype {} provided but default value of {} also provided.".format(dtype, defaultContent)
				raise ValueError(error_str)

			self.dtype = 'bool'
		elif _dtype in ['timestamp', 'ts', 'datetime']:
			self.dtype = 'timestamp'
		else:
			self.dtype = 'other'
			
		self.defaultContent = defaultContent
		return

	def prepare(self, unique_id=None):

		if self.is_unique_id is True and unique_id is not None:
			assert self.name == unique_id, 'Conflicting unique ids provided. \
				Column unique_id is {} and provided is {}'.format(self.name, unique_id)

			
		column_params = {'name': self.name,
			'data': self.data,
			'order': self.order,
			'label': self.name if self.label is None else self.label, 
			'editable': self.editable,
			'dtype': self.dtype,
			'defaultContent': self.defaultContent}

		return column_params


class DataTable(object):

	
	def __init__(self, obj, column_order, system_columns, *, 
			unique_id=None, columns=None, table_id=None, allowed_query_operators=None):

		self.obj = obj
		self.table_name = self.obj.__table__.name
		
		# Database columns
		self.table_columns = self.obj.__table__.columns.keys()
		# DataTableColumn objects if wanting to not use
		# default arguments.
		if columns is not None:
			assert isinstance(columns, list), 'Columns kwarg is expecting a list of DataTableColumn objects'
			self.columns = columns
		else:
			self.columns = []

		# Uses the default ordering of the columns in the table if 
		# nothing is specified. As of writing this code, this 
		# behavior was to alphabetize the columns.
		self.column_order = self.table_columns if column_order is None else column_order
		self.table_id = self.table_name if table_id is None else table_id
		self.column_dtypes = {}
		for col in self.table_columns:
			self.column_dtypes[col] = getattr(self.obj, col).property.columns[0].type
		
		
		if system_columns is None:
			if hasattr(obj, 'system_columns'):
				# covers the case someone is lazy but defined it properly in their model.
				self.system_columns = getattr(self.obj, 'system_columns')
			else:
				self.system_columns = []
		else:
			assert isinstance(system_columns, list), "System columns parameter is required to be a list."
			self.system_columns = system_columns

		if unique_id is None:
			primary_keys = obj.__table__.primary_key.columns.keys()
			if len(primary_keys) != 1:
				raise ValueError('Only tables with a single integer primary key are supported.')	
			else:
				self.unique_id = primary_keys[0]
		else:
			assert isinstance(unique_id, str), "unique_id param must be the string name of the table's primary key."
			self.unique_id = unique_id


		# Used later
		self.ordered_columns = None

	def sort_columns(self):
		self.ordered_columns = sorted(self.columns, key=lambda col: col.order)
	
	def _build_default_column(self, name, column_order, string_default=None, bool_default=None, exclude_columns=None):

		# Checking early if we're even going to display the column
		if exclude_columns is not None:
			if name in exclude_columns:
				return None


		col_dtype = self.column_dtypes[name]
		try:
			col_order = column_order[name]
		except KeyError:
			raise KeyError('Column found on model and was not given an appropriate column order and was not excluded.')
		


		# System columns & system generated primary keys are 
		# not editable by default.
		if name == self.unique_id or name in self.system_columns:
			return DataTableColumn(name, col_order, dtype=col_dtype, editable=False, 
				defaultContent=0)

		if str(col_dtype) == 'BOOLEAN':
			return DataTableColumn(name, col_order, dtype=col_dtype,
				defaultContent=bool_default)
		else:
			return DataTableColumn(name, col_order, dtype=col_dtype,
				defaultContent=string_default)



	def prepare(self, string_default="No Value Present", bool_default=True, exclude_columns=None):

		"""
		Creates a column object for each key in the first
		dictionary if not provided. 
		Disallows editing for names if part of the primary key
		Emptytext for primary key names is pk_emptytext
		"""

		column_order = {col: order for order, col in enumerate(self.column_order)}
		
		if self.columns == []:
			for name in self.table_columns:
				default_column = self._build_default_column(name, column_order,
					string_default=string_default, bool_default=bool_default,
					exclude_columns=exclude_columns)

				if default_column is not None:
					self.columns.append(default_column)
				
		else:
			existing_columns = self.columns
			existing_col_names = [col.name for col in existing_columns]

			for name in column_order:
				if name not in existing_col_names:
					default_column = self._build_default_column(name, column_order,
					string_default=string_default, bool_default=bool_default,
					exclude_columns=exclude_columns)

					if default_column is not None:
						self.columns.append(default_column)

			self.columns = existing_columns

		
		column_data = [col.prepare() for col in self.columns]
		prepared_ordered_columns = sorted(column_data, key=lambda col: col['order'])
		
		

		return {
			'unique_id': self.unique_id,
			'table_name': self.table_name, 
			'table_id': self.table_id, 
			'columns': prepared_ordered_columns
			}