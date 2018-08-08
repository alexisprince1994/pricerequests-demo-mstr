from flask import Blueprint, render_template, jsonify, redirect, url_for, request, flash
from server.models import Customer, Product, PriceRequestStatus
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

	return render_template('pricerequests.html')


@pricerequest.route('/prices/<id>')
def prices(id):
	print('id is {}'.format(id))
	product = Product.query.filter_by(productid=id).one()
	return jsonify({'price': product.price, 'id': id})

@pricerequest.route('/products')
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
def price_request_statues():

	query_results = PriceRequestStatus.query.all()
	results = [{'statuscode': status.statuscode, 'statusdescription': status.statusdescription,
		'reviewed': status.reviewed} for status in query_results]

	return jsonify(results)
