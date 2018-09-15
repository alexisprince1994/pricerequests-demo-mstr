from flask import render_template, url_for, redirect, Blueprint
from flask_login import current_user, login_required
from app.models import User
from app import db


homepage = Blueprint('homepage', __name__)



@homepage.route('/home')
@homepage.route('/')
@homepage.route('/index')
@login_required
def index():

	
	routes = {}
	if current_user.active:
		routes['price_requests'] = [
		{'display': 'Price Request Submission', 'route': '/pricerequests'},
		{'display': 'Price Request Approval', 'route': '/pricerequests/view'}]

	if not current_user.read_only:
		routes['editrefs'] = [
			{'display': 'Customers', 'route': '/editref/customer'}, 
			{'display': 'Price Request Statuses', 'route': '/editref/pricerequeststatus'},
			{'display': 'Products', 'route': '/editref/product'}
		]

	return render_template('homepage.html', routes=routes, read_only=current_user.read_only)


@homepage.route('/notauthorized')
def not_authorized():

	return render_template('not_authorized.html')