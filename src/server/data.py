

def create_categories(Category, db):

	categories = ['Electronics', 'Books']

	for category in categories:
		db.session.add(Category(categoryname=category))

	db.session.commit()


def create_products(Product, db):

	products = ['100 Places to Go While Still Young at Heart',
      'Art As Experience',
      'The Painted World',
      'Hirschfeld on Line',
      'Adirondack Style',
      'Architecture: Form, Space, & Order',
      '50 Favorite Rooms',
      '500 Best Vacation Home Plans',
      'Blue & White Living',
      'Ways of Seeing',
      'Gonzo, the Art',
      'Cabin Fever: Rustic Style Comes Home',
      'American Bungalow Style'
    ]
	
	prices = [
	    46,
	    11,
	    6,
	    35,
	    27,
	    28,
	    18,
	    8,
	    11,
	    11,
	    28,
	    15,
	    9
    ]

	costs = [
    	33,
    	8,
    	5,
    	26,
    	20,
    	21,
    	13,
    	6,
    	8,
    	8,
    	22,
    	6,
    	21
    ]

	for product, price, cost in zip(products, prices, costs):
		db.session.add(Product(productname=product, categoryid=2, price=price, cost=cost))

	db.session.commit()


def create_customers(Customer, db):

	customers = [
	'BMG', 
	'Sony Music',
	'Virgin Records',
	'Columbia Pictures',
	'WEA',
	'Universal Studios',
	'Perigree',
	'TriStar Pictures'
	]

	for customer in customers:
		db.session.add(Customer(customername=customer))
	db.session.commit()


def create_statuses(PriceRequestStatus, db):

	statuses = ['SUBMITTED', 'APPROVED', 'DENIED']
	descriptions = ['SUBMITTED AND NOT REVIEWED', 
	'REVIEWED AND APPROVED', 'REVIEWED AND DENIED']
	reviewed = [False, True, True]

	for status, description, review in zip(statuses, descriptions, reviewed):
		db.session.add(PriceRequestStatus(statuscode=status,
			statusdescription=description, reviewed=review))

	db.session.commit()

def create_data(Category, Product, Customer, db, PriceRequestStatus):

	create_customers(Customer, db)
	create_products(Product, db)
	create_categories(Category, db)