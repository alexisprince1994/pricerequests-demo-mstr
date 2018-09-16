from flask import url_for, request
from tests.base import BaseTestCase
import unittest
import json
import os
from app import app, db, bcrypt
from app.models import Product, Customer, PriceRequestStatus, PriceRequest, User
from app.data import create_data, create_price_requests
from flask_login import login_user, current_user
from flask_testing import TestCase


class TestPriceRequestUIEndPoints(TestCase):

	def create_app(self):
		"""
		Creates an instances of the application w/ testing config.
		"""
		app.config.from_object('app.config.TestingConfig')
		return app

	def setUp(self):

		db.create_all()
		db.session.commit()

		self.test_user = User(username='TEST', 
			email='admin@example.com', 
			password=bcrypt.generate_password_hash('password1').decode('utf-8'),
			read_only=False, active=True)

		db.session.add(self.test_user)
		db.session.commit()

		create_data(Product, Customer, db, PriceRequestStatus)

	def tearDown(self):

		db.session.remove()
		db.drop_all()

	def login_user(self):

		self.client.post(url_for('users.login'), data={
			'email': self.test_user.email, 'password': 'password1'
			})


	def test_customer_search_gives_results(self):

		self.login_user()
		response = self.client.get(url_for('pricerequest.customers'), query_string={'q': 'Sony'})
		self.assertEqual(len(response.get_json()), 1)

	def test_customer_search_not_case_sensitive(self):

		self.login_user()
		response = self.client.get(url_for('pricerequest.customers'), query_string={'q': 'sony'})
		self.assertEqual(len(response.get_json()), 1)

	def test_product_search_gives_results(self):

		self.login_user()
		response = self.client.get(url_for('pricerequest.products'), query_string={'q': 'Art'})
		self.assertEqual(len(response.get_json()), 3)

	def test_product_search_bad_term(self):

		self.login_user()
		response = self.client.get(url_for('pricerequest.products'), query_string={'q': 
			'my incredibly long and very precise missing search term'})
		self.assertEqual(len(response.get_json()), 0)

	def test_product_search_proper_format(self):

		self.login_user()
		response = self.client.get(url_for('pricerequest.products'), query_string={'q': 'Art'})
		for row in response.get_json():
			self.assertIsNotNone(row['id'])
			self.assertIsNotNone(row['label'])


	def test_customer_search(self):

		self.login_user()


class TestPriceRequest(TestCase):

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

		create_data(Product, Customer, db, PriceRequestStatus)
		create_price_requests(PriceRequest, Product, Customer, db)

		db.session.commit()

		self.test_user = User(username='TEST', 
			email='admin@example.com', 
			password=bcrypt.generate_password_hash('password1').decode('utf-8'),
			read_only=False, active=True)
		db.session.add(self.test_user)
		db.session.commit()

	def tearDown(self):
		"""
		Drops database tables and remove session
		"""

		db.session.remove()
		db.drop_all()

	def login_user(self, email, password):

		return self.client.post(url_for('users.login'), data={
			'email': email, 'password': password
			})	

	def test_status_change_successful(self):

		with self.client:

			self.login_user('admin@example.com', 'password1')
			
			pr = PriceRequest.query.filter_by(statuscode='SUBMITTED').first()
			pr_id = pr.pricerequestid
			self.assertIsNotNone(pr, 'No price requests with status submitted.')

			# Ensuring we aren't trying to change it to the same status
			new_status = PriceRequestStatus.query.filter(
				PriceRequestStatus.statuscode != pr.statuscode).first()

			response = self.client.post(url_for('pricerequest.statuschange'),
				headers={'content-type': 'application/json'},
				json={'id': pr.pricerequestid,
				'status': new_status.statuscode})

			self.assertTrue(response.status_code == 200)
			self.assertIsNone(response.get_json()['error'])


			# Re-querying since we just updated from a different route
			pr = PriceRequest.query.get(pr_id)
			self.assertEqual(pr.statuscode, new_status.statuscode)

	def test_status_change_bad_id(self):

		with self.client:

			self.login_user(self.test_user.email, 'password1')
			
			# Ensuring we aren't trying to change it to the same status
			new_status = PriceRequestStatus.query.filter_by(statuscode='DENIED').first()

			response = self.client.post('/pricerequests/statuschange', headers={
				'content-type': 'application/json'}, json={
					'id': 'some bad id', 'status': new_status.statuscode})

			self.assertTrue(response.status_code == 200)
			self.assertIsNotNone(response.get_json()['error'])
			self.assertIsNone(response.get_json().get('id'))

	def test_status_change_bad_status(self):

		with self.client:

			pr = PriceRequest.query.first()

			self.login_user(self.test_user.email, 'password1')
			
			response = self.client.post('/pricerequests/statuschange', headers={
				'content-type': 'application/json'}, json={
					'id': pr.pricerequestid, 'status': 'TOTALLY MADE UP'})

			self.assertTrue(response.status_code == 200)
			self.assertIsNotNone(response.get_json()['error'])
			self.assertIsNone(response.get_json().get('id'))
			
		
