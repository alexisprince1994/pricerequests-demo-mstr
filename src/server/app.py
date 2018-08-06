from flask import Flask, render_template, jsonify, request
from models import db, Category, Product, Customer, PriceRequestStatus
from data import create_data

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")
db.init_app(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@app.route('/')
def index():

	return 'hello world!'


@app.route('/pricerequests')
def pricerequests():

	return render_template('pricerequests.html')


@app.route('/prices/<id>')
def prices(id):
	print('id is {}'.format(id))
	product = Product.query.filter_by(productid=id).one()
	return jsonify({'price': product.price, 'id': id})

@app.route('/products')
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

@app.route('/customers')
def customers():

	search_term = request.args.get('q')

	if search_term:
		query_results = Customer.query.filter(Customer.customername.like(search_term)).all()
	else:
		query_results = Customer.query.all()
	results = [{'customerid': customer.customerid, 'customername': customer.customername} for customer in query_results]

	return jsonify(results)

@app.route('/pricerequeststatuses')
def price_request_statues():

	query_results = PriceRequestStatus.query.all()
	results = [{'statuscode': status.statuscode, 'statusdescription': status.statusdescription,
		'reviewed': status.reviewed} for status in query_results]

	return jsonify(results)


if __name__ == '__main__':
	with app.app_context():
		db.drop_all()
		db.create_all()
		create_data(Category, Product, Customer, db)
	app.run(debug=True)