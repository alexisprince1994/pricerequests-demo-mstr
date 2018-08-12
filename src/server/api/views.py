from flask import Blueprint, request, jsonify
from server.models import PriceRequest, db

api = Blueprint('api', __name__)

def most_recent_request(PriceRequest):

	price_request = PriceRequest.query.filter(
				PriceRequest.statuscode == 'PENDING').order_by(
				'-ludate').first()

	return price_request

@api.route('/api/get')
def get():

	request_id = request.args.get('id')

	data_out = {}

	if request_id is not None:
		price_request = PriceRequest.query.get(request_id)

		if price_request is None:
			price_request = most_recent_request(PriceRequest)
		
	else:
		price_request = most_recent_request(PriceRequest)


	data_out['customerid'] = price_request.customerid
	data_out['customer_name'] = price_request.customer.customername
	data_out['productid'] = price_request.productid
	data_out['product_name'] = price_request.product.productname
	data_out['normal_price'] = price_request.product.price
	data_out['cost'] = price_request.product.cost
	data_out['requested_price'] = price_request.requestedprice
	data_out['requested_units'] = price_request.requestedunits
	data_out['request_reason'] = price_request.requestreason
	data_out['id'] = price_request.pricerequestid

	return jsonify(data_out)


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
		