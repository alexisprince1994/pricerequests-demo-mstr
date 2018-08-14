from flask import Blueprint, render_template, jsonify, redirect, url_for, request, flash
from server.models import db, Customer, Product, PriceRequestStatus, PriceRequest
from flask_login import current_user, login_required

pricerequest = Blueprint('pricerequest', __name__, static_folder='../static/dist', template_folder='../static')


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


@pricerequest.route('/prices/<id>')
@login_required
def prices(id):
	print('id is {}'.format(id))
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
