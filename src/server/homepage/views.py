from flask import render_template, url_for, redirect, Blueprint
from flask_login import current_user, login_required
from server.models import User, db


homepage = Blueprint('homepage', __name__)



@homepage.route('/home')
@homepage.route('/')
@homepage.route('/index')
@login_required
def index():

	routes = {}
	if current_user.active:
		routes['price_requests'] = [{'display': 'Price Requests', 'route': '/pricerequests'}]

	if not current_user.read_only:
		routes['editrefs'] = [{'display': 'Customers', 'route': '/editrefs/customers'}, 
		{'display': 'Price Request Statuses', 'route': '/editrefs/pricerequeststatuses'},
		{'display': 'Products', 'route': '/editrefs/products'}
		]

	return render_template('homepage.html', routes=routes, read_only=current_user.read_only)


@homepage.route('/notauthorized')
def not_authorzied():

	return render_template('not_authorized.html')