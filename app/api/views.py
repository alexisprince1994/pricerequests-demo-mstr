from flask import Blueprint, request, jsonify, make_response
import os
from app.models import Customer, Product, PriceRequest
from app import db
from sqlalchemy import desc

api = Blueprint('api', __name__)



@api.route('/api/pricerequest/get')
def get():

	auth_token = request.headers.get('X-AUTH-TOKEN')

	if auth_token != os.environ.get('SLACK_AUTH_TOKEN'):
		return make_response(jsonify({'error_message': 
			'Please attach auth token as header with key SLACK_AUTH_TOKEN'}), 403)

	price_request = (PriceRequest
		.query
		.filter_by(statuscode='SUBMITTED')
		.join(Customer)
		.join(Product)
		.order_by(desc(PriceRequest.ludate)).first())
	
	if price_request:
		data_out = {}
		data_out['customer_name'] = price_request.customer.customername
		data_out['product_name'] = price_request.product.productname
		data_out['current_price'] = price_request.product.price
		data_out['cost'] = price_request.product.cost
		data_out['requested_price'] = price_request.requestedprice
		data_out['requested_units'] = price_request.requestedunits
		data_out['request_reason'] = price_request.requestreason
		data_out['id'] = price_request.pricerequestid
		data_out['statuscode'] = price_request.statuscode
		data_out['request_date'] = price_request.submittimestamp.date().strftime('%m/%d/%Y')
		post_url = 'pricerequest/api/post/{}'.format(price_request.pricerequestid)
		return jsonify({
		'price_request': data_out, 
		'post_route': post_url,
		'actions': ['APPROVED', 'DENIED']})
	else:
		return jsonify({
			'error_message': "No outstanding price requests! You're all caught up!"
			})

	


@api.route('/api/pricerequest/post/<id>', methods=['POST'])
def post(id):

	auth_token = request.headers.get('X-AUTH-TOKEN')

	if auth_token != os.environ.get('SLACK_AUTH_TOKEN'):
		if request.url_root != 'http://127.0.0.1:5000/':
			return make_response(jsonify({'error_message': 
			'Please attach auth token as header with key SLACK_AUTH_TOKEN'}), 403)
			

	data = request.get_json()

	action = data.get('action')
	
	price_request = PriceRequest.query.get(id)
	if price_request is None:
		return make_response(400,
			error_message='price request not found for id {}'.format(id))
	else:
		price_request.statuscode = action
		db.session.add(price_request)
		db.session.commit()
		return make_response(200)
		