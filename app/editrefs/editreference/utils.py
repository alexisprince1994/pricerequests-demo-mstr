import datetime
from datetime import timezone

def sqlalchemy_converter(model, data, timestamp_columns=None, column_exclusions=None):
	"""
	:param model: object, flask sqlalchemy model
	:param data: list, list of model objects
	:param timestamp_columns: list, list of column names (as strings) 
		that will be converted to unix timestamps.
	:param column_exclusions: list, list of column names (as strings) 
		that will not be converted for serialization.
	"""

	all_columns = model.__table__.columns.keys()
	if column_exclusions:
		columns = [col for col in all_columns if col not in column_exclusions]
	else:
		columns = all_columns
	data_out = []

	for instance in data:
		data_dict = {}
		for col in columns:
			if timestamp_columns:
				if col in timestamp_columns:
					data_dict[str(col)] = (getattr(instance, col)  - datetime.datetime(1970, 1, 1, tzinfo=timezone.utc)).total_seconds()
				else:
					data_dict[str(col)] = getattr(instance, col)
			else:
				data_dict[str(col)] = getattr(instance, col)

		data_out.append(data_dict)

	return data_out