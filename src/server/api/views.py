from flask import Blueprint, request, jsonify
from server.models import Customer, Product, PriceRequest, db
from sqlalchemy import desc
import datetime

api = Blueprint('api', __name__)

def price_request_to_json(price_request):

	data_out = {}
	data_out['customer_name'] = price_request.customer.customername
	data_out['product_name'] = price_request.product.productname
	data_out['normal_price'] = price_request.product.price
	data_out['cost'] = price_request.product.cost
	data_out['requested_price'] = price_request.requestedprice
	data_out['requested_units'] = price_request.requestedunits
	data_out['request_reason'] = price_request.requestreason
	data_out['id'] = price_request.pricerequestid
	data_out['statuscode'] = price_request.statuscode
	data_out['request_date'] = price_request.submittimestamp.date().strftime('%m/%d/%Y')

	return data_out


@api.route('/pricerequest/api/get')
def get():

	print('PriceRequest.query.all is {}'.format(PriceRequest.query.all()))
	price_requests = (PriceRequest
		.query
		.join(Customer)
		.join(Product)
		.order_by(desc(PriceRequest.ludate)).all())

	print('there are {} price requests'.format(len(price_requests)))
	
	return jsonify([price_request_to_json(price_request) for price_request in price_requests])


@api.route('/api/post', methods=['POST'])
def post():

	data = request.get_json()

	action = data.get('action')
	id = data.get('id')

	if id is None:
		return make_response(400, error_message='price request id was invalid')
		
	price_request = PriceRequest.query.get(id)
	if price_request is None:
		return make_response(400,
			error_message='price request not found for id {}'.format(id))
	else:
		price_request.statuscode = action
		db.session.add(price_request)
		db.session.commit()
		return make_response(200)
		