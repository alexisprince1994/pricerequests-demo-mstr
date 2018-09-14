# 3rd Party Libraries
from flask import Blueprint, render_template, jsonify, request, session

# Project Specific Imports
from app import db
from app.models import Customer, Product, PriceRequest, PriceRequestStatus
from app.querybuilder import QueryBuilder
from app.editrefs.editreference import EditReference, ClientServerException
from app.editrefs.editreference.utils import sqlalchemy_converter
from app.findtable import FindTable
from flask_login import current_user, login_required
from app.datatables import DataTable

editrefs = Blueprint('editrefs', __name__)

@editrefs.route('/editref/customer', methods=['POST', 'PUT', 'DELETE', 'GET'])
@login_required
def editref_customer():

	response = []
	obj = Customer

	if request.method == 'GET':
		# Indicates it was a get request generated from using the find menu
		if 'filter[]' in request.args:
			builder = QueryBuilder(obj.query, 
				operator_mapping=FindTable.default_operator_mapping)

			builder.filter_query(request)
			requested_data = builder.query.all()
			return jsonify(sqlalchemy_converter(obj, requested_data, 
				timestamp_columns=['crdate', 'ludate']))

		# Otherwise, its a get request to load the page.
		else:
			data_table = DataTable(obj, obj.column_orders, 
				system_columns=obj.system_columns)

			prepared_data_table = data_table.prepare()

			data_table.sort_columns()
			find_table = FindTable.from_datatable(data_table, request.path)

			info = {'table': prepared_data_table,
				'find_table':  find_table.prepare(),
				'title': 'Super Sweet Title',
				'submit_url': request.path}

			return render_template('editref.html', **info)

	client_data = request.get_json()

	editref_kwargs = {
		'table': obj,
		'system_columns': obj.system_columns,
		'editable_columns': [col for col in obj.__table__.columns.keys() if col not in obj.system_columns],
		'columns': [col for col in obj.__table__.columns.keys()],
		'pk': 'customerid',
		'requesting_username': current_user.username
	}

	edit_ref = EditReference(db, client_data, request.method, **editref_kwargs)
	
	request_had_errors = False

	response_data = []
	processor = edit_ref.process()
	for client_processed_row in processor:
		if not client_processed_row['modified_ok']:
			request_had_errors = True
		response_data.append(client_processed_row)

	response = {'request_had_errors': request_had_errors, 'data': response_data}
	return jsonify(response)


@editrefs.route('/editref/product', methods=['POST', 'PUT', 'DELETE', 'GET'])
@login_required
def editref_product():

	response = []
	obj = Product

	if request.method == 'GET':
		# Indicates it was a get request generated from using the find menu
		if 'filter[]' in request.args:
			builder = QueryBuilder(obj.query, 
				operator_mapping=FindTable.default_operator_mapping)

			builder.filter_query(request)
			requested_data = builder.query.all()
			return jsonify(sqlalchemy_converter(obj, requested_data, 
				timestamp_columns=['crdate', 'ludate']))

		# Otherwise, its a get request to load the page.
		else:
			data_table = DataTable(obj, obj.column_orders, 
				system_columns=obj.system_columns)

			prepared_data_table = data_table.prepare()

			data_table.sort_columns()
			find_table = FindTable.from_datatable(data_table, request.path)

			info = {'table': prepared_data_table,
				'find_table':  find_table.prepare(),
				'title': 'Super Sweet Title',
				'submit_url': request.path}

			return render_template('editref.html', **info)

	client_data = request.get_json()
	
	
	editref_kwargs = {
		'table': obj,
		'system_columns': obj.system_columns,
		'editable_columns': [col for col in obj.__table__.columns.keys() if col not in obj.system_columns],
		'columns': [col for col in obj.__table__.columns.keys()],
		'pk': 'productid',
		'requesting_username': current_user.username
	}

	edit_ref = EditReference(db, client_data, request.method, **editref_kwargs)
	
	request_had_errors = False

	response_data = []
	processor = edit_ref.process()
	for client_processed_row in processor:
		if not client_processed_row['modified_ok']:
			request_had_errors = True
		response_data.append(client_processed_row)

	response = {'request_had_errors': request_had_errors, 'data': response_data}
	return jsonify(response)

@editrefs.route('/editref/pricerequeststatus', methods=['POST', 'PUT', 'DELETE', 'GET'])
@login_required
def editref_pricerequeststatus():

	response = []
	obj = PriceRequestStatus

	if request.method == 'GET':
		# Indicates it was a get request generated from using the find menu
		if 'filter[]' in request.args:
			builder = QueryBuilder(obj.query, 
				operator_mapping=FindTable.default_operator_mapping)

			builder.filter_query(request)
			requested_data = builder.query.all()
			return jsonify(sqlalchemy_converter(obj, requested_data, 
				timestamp_columns=['crdate', 'ludate']))

		# Otherwise, its a get request to load the page.
		else:
			data_table = DataTable(obj, obj.column_orders, 
				system_columns=obj.system_columns)

			prepared_data_table = data_table.prepare()

			data_table.sort_columns()
			find_table = FindTable.from_datatable(data_table, request.path)

			info = {'table': prepared_data_table,
				'find_table':  find_table.prepare(),
				'title': 'Super Sweet Title',
				'submit_url': request.path}

			return render_template('editref.html', **info)

	client_data = request.get_json()
	
	
	editref_kwargs = {
		'table': obj,
		'system_columns': obj.system_columns,
		'editable_columns': [col for col in obj.__table__.columns.keys() if col not in obj.system_columns],
		'columns': [col for col in obj.__table__.columns.keys()],
		'pk': 'pricerequeststatusid',
		'requesting_username': current_user.username
	}

	edit_ref = EditReference(db, client_data, request.method, **editref_kwargs)
	
	request_had_errors = False

	response_data = []
	processor = edit_ref.process()
	for client_processed_row in processor:
		if not client_processed_row['modified_ok']:
			request_had_errors = True
		response_data.append(client_processed_row)

	response = {'request_had_errors': request_had_errors, 'data': response_data}
	return jsonify(response)