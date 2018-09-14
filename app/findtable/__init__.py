
class FindColumn(object):

	def __init__(self, name, dtype, operators, label=None, values=None):
		self.name = name
		self.dtype = dtype
		self.operators = operators
		self.values = values
		self.label = label


class FindTable(object):

	default_operator_mapping = {
		'eq': 'Equals',
		'ne': "Doesn't Equal",
		'gt': 'Greater Than',
		'lt': 'Less Than',
		'ge': 'Greater Than or Equal To',
		'le': 'Less Than or Equal To',
		'contains': 'Contains',
		'in': 'One of',
		'notin': 'Not One of',
		'is null': 'Is Null',
		'is not null': 'Is Not Null',
	}

	boolean_operator_mapping = {
		'eq': 'Equals',
		'ne': "Doesn't Equal"
	}

	boolean_values = [
		True,
		False,
	]

	def __init__(self, columns, path):
		"""
		Instantiates the find table object. Ensures operators are
		mapped properly to column names based on their data types.
		:param column_order: list, list of strings for the searchable
			columns
		:param columns: list of dict, expected the format of 
			{"name": "name of the column in the database",
			"dtype": "data type as string",
			"label": "alias to show the user (optional)"}
		:param path: str, path to send the get request generated
			by the user to. Typically it will be the path
			the user is in (ajax call), but I'm putting this here
			in case that ever changes (put a handler or something)
		"""

		self.columns = columns
		self.path = path
		self.build_column_operators()


	@classmethod
	def from_datatable(cls, datatable, *args, **kwargs):
		assert hasattr(datatable, 'ordered_columns'), "Ordered columns are required for this constructor."
		columns = [{'name': col.name, 'dtype': col.dtype, 
			'label': col.label} for col in datatable.ordered_columns]
		return cls(columns, *args, **kwargs)
		
	def build_column_operators(self):
		"""
		Assigns operators to columns based on their data types
		This allows the find window on the modal table to be
		more intuitive (not allowing users to select greater than
		for a boolean value, etc. Also allows for further customization 
		in the future (datepickers, etc.))
		"""
		for col in self.columns:
			dtype = col['dtype']
			if dtype == 'bool':
				operators = self.boolean_operator_mapping
				values = self.boolean_values
			else:
				operators = self.default_operator_mapping
				values = None

			col['operators'] = operators
			col['values'] = values

	def prepare(self):
		return {
			'columns': self.columns,
			'default_operators': self.default_operator_mapping,
			'boolean_operators': self.boolean_operator_mapping,
		}


	def __repr__(self):
		return '<FindTable {}>'.format(self.__dict__)

	def __str__(self):
		return str('FindTable with columns: {}'.format(self.columns))