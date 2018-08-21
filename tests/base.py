from app import app, db
from flask_testing import TestCase


class BaseTestCase(TestCase):

	def create_app(self):
		"""
		Creates an instances of the application w/ testing config.
		"""
		app.config.from_object('app.config.TestingConfig')
		return app

	def setUp(self):
		"""
		Creates the database and tables.
		"""

		db.create_all()
		db.session.commit()

	def tearDown(self):
		"""
		Drops database tables and remove session
		"""
		db.session.remove()
		db.drop_all()

