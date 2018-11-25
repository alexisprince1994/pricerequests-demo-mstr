from flask_script import Manager
from app import app, db, models, bcrypt
from app.data import create_data
from app.models import Product, Customer, PriceRequestStatus, User
import unittest
import os

manager = Manager(app)

@manager.command
def test():
	"""
	Runs tests without coversage
	"""
	tests = unittest.TestLoader().discover('tests', pattern='test*.py')
	result = unittest.TextTestRunner(verbosity=2).run(tests)
	if result.wasSuccessful():
		return 0
	return 1

@manager.command
def reset_db():
	"""
	Drops and recreates the database. Used only in development.
	Will throw an error if app is in production mode.
	"""

	if not app.config.get('DEBUG'):
		raise ValueError('Cannot rewrite database outside of development')

	db.drop_all()
	db.create_all()

	create_data(Product=Product, Customer=Customer, db=db, 
		PriceRequestStatus=PriceRequestStatus)

	admin_password = os.environ.get('ADMIN_PASSWORD')
	hashed_admin_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
	admin = User(username='admin', email='admin@example.com', password=hashed_admin_password,
		active=True, read_only=False)
	db.session.add(admin)
	db.session.commit()




if __name__ == "__main__":
	manager.run()