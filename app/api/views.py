from flask import Blueprint, request, jsonify, make_response, Response
import os
from app.models import Customer, Product, PriceRequest
from app import db
from sqlalchemy import desc

api = Blueprint('api', __name__)

def make_error(msg):

	return jsonify({'error_message': msg})

@api.route('/api/pricerequest/get')
def get():

	auth_token = request.headers.get('X-SLACK-AUTH-TOKEN')

	if auth_token != os.environ.get('SLACK_AUTH_TOKEN'):
		return make_response(
			make_error('Please attach auth token as header with key X-SLACK-AUTH-TOKEN'), 403)

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
		return jsonify({
		'price_request': data_out, 
		'actions': ['APPROVED', 'DENIED']})
	else:
		return make_error("No outstanding price requests! You're all caught up!")
		

	
@api.route('/api/pricerequest/post/<id>', methods=['POST'])
def post(id):

	
	auth_token = request.headers.get('X-SLACK-AUTH-TOKEN')

	if auth_token != os.environ.get('SLACK_AUTH_TOKEN'):
		return make_response(make_error('Please attach auth token as header with key X-SLACK-AUTH-TOKEN'), 403)

	action = request.get_json().get('action')
	
	price_request = PriceRequest.query.get(id)
	if price_request is None:
		return make_response(
			make_error('price request not found for id {}'.format(id)), 400)
			
	else:
		if price_request.statuscode != 'SUBMITTED':
			msg = 'Cannot change a price request from status {} to {} through \
				the Slack UI. Please go through the web UI.'.format(price_request.statuscode, action)
			return make_response(make_error(msg), 400)
		try:
			price_request.statuscode = action
			db.session.add(price_request)
			db.session.commit()
			return Response(), 204
		except Exception as e:
			db.session.rollback()
			return make_response(make_error(str(e)), 400)


		