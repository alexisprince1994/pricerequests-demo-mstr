from flask import Blueprint, request, jsonify
from server.models import Customer, Product, PriceRequest, db


api = Blueprint('api', __name__)



@api.route('/pricerequest/api/get')
def get():
	pass
	


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
		