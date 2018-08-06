from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def pk(db):

	return db.Column(db.Integer, primary_key=True)

class Category(db.Model):

	__tablename__ = 'categories'

	categoryid = pk(db)
	categoryname = db.Column(db.String(25), nullable=False, unique=True)

class Product(db.Model):

	__tablename__ = 'products'

	productid = pk(db)
	categoryid = db.Column(db.Integer, db.ForeignKey('categories.categoryid'),
		nullable=False, index=True)
	productname = db.Column(db.String(50), nullable=False, unique=True)

	price = db.Column(db.Float, nullable=False)
	cost = db.Column(db.Float, nullable=False)

	category = db.relationship('Category', backref=db.backref('products'), lazy=True)


	def __repr__(self):
		return '<Product %r>' % self.productname

class Customer(db.Model):

	__tablename__ = 'customers'

	customerid = pk(db)
	customername = db.Column(db.String(50), nullable=False, unique=True)

	def __repr__(self):
		return '<Customer %r>' % (self.customername)

class PriceRequestStatus(db.Model):

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
	customerid = db.Column(db.Integer, db.ForeignKey('customers.customerid'), nullable=False, index=True)
	productid = db.Column(db.Integer, db.ForeignKey('products.productid'), nullable=False)
	statuscode = db.Column(db.String(20), db.ForeignKey('pricerequeststatuses.statuscode'), nullable=False)
	requestedprice = db.Column(db.Float, nullable=False)
	submittimestamp = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
	ludate = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), 
		onupdate=db.func.now())

	product = db.relationship('Product', backref=db.backref('pricerequests'), lazy=True)
	customer = db.relationship('Customer', backref=db.backref('pricerequests'), lazy=True)
	status = db.relationship('PriceRequestStatus', backref=db.backref('pricerequests'), lazy=True)


	def __repr__(self):
		return '<PriceRequst %r %r %r %r %r %r>' % (self.customerid, self.productid, self.statuscode,
			requestedprice, submittimestamp, ludate)

