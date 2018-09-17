from flask import Blueprint, render_template, jsonify, redirect, url_for, request, flash
from app.models import Customer, Product, PriceRequestStatus, PriceRequest
from app import db, csrf
from flask_login import current_user, login_required
from sqlalchemy import desc
import datetime
import logging




logging.basicConfig(level=logging.DEBUG)

pricerequest = Blueprint('pricerequest', __name__, 
	static_folder='../static/dist', template_folder='../static')



def redirect_not_authorized():
	return redirect(url_for('homepage.not_authorized'))

def redirect_register():
	return redirect(url_for('users.login'))

@pricerequest.route('/pricerequests', methods=['GET', 'POST'])
@login_required
def pricerequests():

	if not current_user.active:
		return redirect_not_authorized()

	if current_user.read_only and request.method == 'POST':
		return redirect_not_authorized()

	if request.method == 'POST':
		data = request.get_json()
		
		try:
			pr = PriceRequest(customerid=data.get('customerid'), productid=data.get('productid'),
				statuscode='SUBMITTED', requestedprice=data.get('requestedPrice'), 
				requestedunits=data.get('units'), requestreason=data.get('requestReason'))
			db.session.add(pr)
			db.session.commit()
			return jsonify({'id': pr.pricerequestid, 'message': 'Submitted successfully'})
		except Exception as e:
			
			db.session.rollback()
			return jsonify({'id': None, 'message': 'Error creating price request.'})
			

	return render_template('pricerequests.html')

def price_request_to_json(price_request):

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

	return data_out

@pricerequest.route('/pricerequests/get')
def get_requests():
	
	price_requests = (PriceRequest
		.query
		.join(Customer)
		.join(Product)
		.order_by(desc(PriceRequest.ludate)).all())

	
	
	serialized_requests = [price_request_to_json(price_request) for price_request in price_requests]
	logging.debug('serialized_requests are {}'.format(serialized_requests))
	return jsonify(serialized_requests)

@pricerequest.route('/pricerequests/statuschange', methods=['POST'])
@login_required
def statuschange():

	if current_user.read_only:
		return redirect_not_authorized()

	data = request.get_json()
	pr_id, status = data.get('id'), data.get('status')

	pr = PriceRequest.query.filter_by(pricerequestid=pr_id).first()
	if not pr:
		return jsonify({'error': 
			'price request not found. Please refresh the browser and try again.'})

	status_obj = PriceRequestStatus.query.filter_by(statuscode=status).first()
	if not status_obj:
		return jsonify({
			'error': 'Invalid new status'
			})
	try:
		pr.statuscode = status
		db.session.add(pr)
		db.session.commit()
	except Exception as e:
		db.session.rollback()
		return jsonify({'error': str(e)})

	return jsonify({'id': pr.pricerequestid, 'error': None, 'statuscode': pr.statuscode})

@pricerequest.route('/pricerequests/delete/<id>', methods=['DELETE'])
@login_required
def delete(id):

	if current_user.read_only:
		return redirect_not_authorized()

	price_request = PriceRequest.query.get(id)
	if price_request is None:
		return jsonify({'error': 'Unable to find this price request.'})

	try:
		db.session.delete(price_request)
		db.session.commit()
		return jsonify({'error': None})
	except Exception as e:
		db.session.rollback()
		return jsonify({'error': 'Unable to delete this price request. The following error occured : {}'.format(str(e))})



@pricerequest.route('/pricerequests/view')
@login_required
def view():

	if current_user.read_only:
		return redirect_not_authorized()

	return render_template('viewpricerequests.html')
	

@pricerequest.route('/prices/<id>')
@login_required
def prices(id):
	if current_user.read_only:
		return redirect_not_authorized()

	product = Product.query.filter_by(productid=id).one()
	return jsonify({'price': product.price, 'id': id})

@pricerequest.route('/products')
@login_required
def products():

	if current_user.read_only:
		return redirect_not_authorized()

	
	search_term = request.args.get('q')
	if search_term:
		query_results = Product.query.filter(
			Product.productname.ilike('%' + search_term + '%')).all()
	else:
		query_results = Product.query.all()

	results = [{'id': product.productid, 'label': product.productname} for product in query_results]
	return jsonify(results)

@pricerequest.route('/customers')
@login_required
def customers():

	search_term = request.args.get('q')

	if search_term:
		query_results = Customer.query.filter(
			Customer.customername.ilike('%' + search_term + '%')).all()
	else:
		query_results = Customer.query.all()
	results = [{'id': customer.customerid, 'label': customer.customername} for customer in query_results]
	return jsonify(results)

@pricerequest.route('/pricerequeststatuses')
@login_required
def price_request_statues():

	query_results = PriceRequestStatus.query.all()
	results = [{'statuscode': status.statuscode, 'statusdescription': status.statusdescription,
		'reviewed': status.reviewed} for status in query_results]

	return jsonify(results)
