from flask import Blueprint, render_template, jsonify, redirect, url_for, request, flash
from server.models import db, Customer, Product, PriceRequestStatus, PriceRequest
from flask_login import current_user, login_required
from sqlalchemy import desc
import datetime

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
		flash('Sorry, read only users cannot submit this form.', 'danger')
		return

	if request.method == 'POST':
		data = request.get_json()
		print('data from pricerequest route is {}'.format(data))
		try:
			pr = PriceRequest(customerid=data.get('customerid'), productid=data.get('productid'),
				statuscode='SUBMITTED', requestedprice=data.get('requestedPrice'), 
				requestedunits=data.get('units'), requestreason=data.get('requestReason'))
			db.session.add(pr)
			db.session.commit()
			print('The followingg data was sent to this route : {}'.format(request.get_json()))
			return jsonify({'id': pr.pricerequestid, 'message': 'Submitted successfully'})
		except Exception as e:
			print('exception hit. rollback caused. {}'.format(e))
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

	print('there are {} price requests'.format(len(price_requests)))

	return jsonify([price_request_to_json(price_request) for price_request in price_requests])

@pricerequest.route('/pricerequests/statuschange', methods=['POST'])
def statuschange():

	data = request.get_json()
	pr_id, status = data.get('id'), data.get('status')

	print('pr_id is {} and status is {}'.format(pr_id, status))
	
	pr = PriceRequest.query.filter_by(pricerequestid=pr_id).first()
	if not pr:
		return jsonify({'error': 
			'price request not found. Please refresh the browser and try again.'})

	try:
		pr.statuscode = status
		db.session.add(pr)
		db.session.commit()
	except Exception as e:
		db.session.rollback()
		return jsonify({'error': str(e)})

	return jsonify({'id': pr.pricerequestid, 'error': None, 'statuscode': pr.statuscode})


@pricerequest.route('/pricerequests/view', methods=['GET', 'POST'])
def view():

	return render_template('viewpricerequests.html')
	

@pricerequest.route('/prices/<id>')
@login_required
def prices(id):
	product = Product.query.filter_by(productid=id).one()
	return jsonify({'price': product.price, 'id': id})

@pricerequest.route('/products')
@login_required
def products():

	search_term = request.args.get('q')
	print('Search term is {}'.format(search_term))
	if search_term:
		query_results = Product.query.filter(
			Product.productname.like('%' + search_term + '%')).all()
	else:
		query_results = Product.query.all()

	results = [{'id': product.productid, 'label': product.productname} for product in query_results]
	print('results are {}'.format(results))
	return jsonify(results)

@pricerequest.route('/customers')
@login_required
def customers():

	search_term = request.args.get('q')

	if search_term:
		query_results = Customer.query.filter(
			Customer.customername.like('%' + search_term + '%')).all()
	else:
		query_results = Customer.query.all()
	results = [{'id': customer.customerid, 'label': customer.customername} for customer in query_results]
	print('results are {}'.format(results))
	return jsonify(results)

@pricerequest.route('/pricerequeststatuses')
@login_required
def price_request_statues():

	query_results = PriceRequestStatus.query.all()
	results = [{'statuscode': status.statuscode, 'statusdescription': status.statusdescription,
		'reviewed': status.reviewed} for status in query_results]

	return jsonify(results)
