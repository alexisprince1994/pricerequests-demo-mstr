from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()


def pk(db):

	return db.Column(db.Integer, primary_key=True)

class LastUpdatedTimestampMixin(object):
	"""
	Creates a create date and last update date on all tables that inherit from this.
	Last update defaults to now for newly created records.
	"""
	
	crdate = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
	ludate = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), 
		onupdate=db.func.now())

class User(db.Model, LastUpdatedTimestampMixin, UserMixin):

	# Not changing __tablename__ to follow convention as 
	# this needs to be user for flask login.
	# Also not changing id to be userid for the same reasons.

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True)
    username = db.Column(db.String(25), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean)
    read_only = db.Column(db.Boolean, default=True)


    column_orders = ['id', 'email', 'username', 'password', 'active',
    	'crdate', 'ludate']

    system_columns = ['id', 'crdate', 'ludate']

    def __str__(self):
    	return self.username

    def __repr__(self):
    	return """User(id={}, email={}, username={}, password={},
    		active={}, confirmed_at={}, read_only={})""".format(self.id, self.email,
    			self.username, "password redacted", self.active,
    			self.confirmed_at, self.read_only)

class Category(db.Model, LastUpdatedTimestampMixin):

	__tablename__ = 'categories'

	categoryid = pk(db)
	categoryname = db.Column(db.String(25), nullable=False, unique=True)

class Product(db.Model, LastUpdatedTimestampMixin):

	__tablename__ = 'products'

	productid = pk(db)
	categoryid = db.Column(db.Integer, db.ForeignKey('categories.categoryid'),
	index=True)
	productname = db.Column(db.String(50), nullable=False, unique=True)

	price = db.Column(db.Float, nullable=False)
	cost = db.Column(db.Float, nullable=False)

	category = db.relationship('Category', backref=db.backref('products'), lazy=True)


	def __repr__(self):
		return '<Product %r>' % self.productname

class Customer(db.Model, LastUpdatedTimestampMixin):

	__tablename__ = 'customers'

	customerid = pk(db)
	customername = db.Column(db.String(50), nullable=False, unique=True)

	def __repr__(self):
		return '<Customer %r>' % (self.customername)

class PriceRequestStatus(db.Model, LastUpdatedTimestampMixin):

	__tablename__ = 'pricerequeststatuses'
	pricerequeststatusid = pk(db)
	statuscode = db.Column(db.String(20), nullable=False, unique=True)
	statusdescription = db.Column(db.String(50), nullable=False)
	reviewed = db.Column(db.Boolean)

	def __repr__(self):
		return '<PriceRequestStatus %r %r %r>' % (self.statuscode, 
			self.statusdescription, self.reviewed)

	def __str__(self):
		return self.statuscode

class PriceRequest(db.Model):

	__tablename__ = 'pricerequests'
	pricerequestid = pk(db)
	customerid = db.Column(db.Integer, 
		db.ForeignKey('customers.customerid'), nullable=False, index=True)
	productid = db.Column(db.Integer, 
		db.ForeignKey('products.productid'), nullable=False)
	statuscode = db.Column(db.String(20), 
		db.ForeignKey('pricerequeststatuses.statuscode'), nullable=False)
	requestedprice = db.Column(db.Float, nullable=False)
	requestedunits = db.Column(db.Integer, nullable=False)
	requestreason = db.Column(db.String(255))
	submittimestamp = db.Column(db.DateTime(timezone=True), 
		server_default=db.func.now())
	ludate = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), 
		onupdate=db.func.now())

	product = db.relationship('Product', 
		backref=db.backref('pricerequests'), lazy=True)
	customer = db.relationship('Customer', 
		backref=db.backref('pricerequests'), lazy=True)
	status = db.relationship('PriceRequestStatus', 
		backref=db.backref('pricerequests'), lazy=True)


	def __repr__(self):
		return '<PriceRequst %r %r %r %r %r %r>' % (self.customerid, 
			self.productid, self.statuscode, self.requestedprice, 
			self.submittimestamp, self.ludate)

