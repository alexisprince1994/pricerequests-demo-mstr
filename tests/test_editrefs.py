from flask import url_for
import time
import copy
import unittest
import json
import os
from app import app, db, bcrypt
from app.models import User, Customer
from flask_testing import TestCase




class TestEditReference(TestCase):

	admin_email = 'admin@example.com'
	admin_password = 'password1'

	def create_app(self):
		"""
		Creates an instances of the application w/ testing config.
		"""
		app.config.from_object('app.config.TestingConfig')
		return app

	def post(self, data):

		return self.client.post(self.route, headers={'content-type': 'application/json'},
			data=json.dumps(data))

	def delete(self, data):

		return self.client.delete(self.route, headers={'content-type': 'application/json'},
			data=json.dumps(data))

	def put(self, data):

		return self.client.put(self.route, headers={'content-type': 'application/json'},
			data=json.dumps(data))

	def get(self, data):

		return self.client.get(self.route, params=data)

	def create_user(self, username, email, password, read_only, active):

		hashed_password=bcrypt.generate_password_hash('password1').decode('utf-8')
		user = User(username=username, email=email, password=hashed_password,
			read_only=read_only, active=active)

		db.session.add(user)
		db.session.commit()

		return user

	def create_admin_user(self):

		admin = self.create_user(username='TEST', email=self.admin_email,
			password=self.admin_password, read_only=False, active=True)

		return admin

	def login_user(self, email, password, follow_redirects=True):

		return self.client.post('/login', headers={'content-type': 'application/json'},
			json={'email': email, 'password': password}, 
			follow_redirects=follow_redirects)

	def setUp(self):
		"""
		Creates the database and tables.
		"""

		db.create_all()
		db.session.commit()

		self.admin_user = self.create_admin_user()

	def tearDown(self):
		"""
		Drops database tables and remove session
		"""

		db.session.remove()
		db.drop_all()


class BaseEditReferenceTests(object):


	def test_login_required(self):

		with self.client:
			response = self.post(self.valid_post_data)
			self.assertTrue(response.status_code, 302)
			self.assertTrue('login' in response.location)

	def test_has_editref_class_attrs(self):

		self.assertTrue(hasattr(self.obj, 'system_columns'))
		self.assertTrue(hasattr(self.obj, 'column_orders'))

	def test_bad_post_non_unique(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)

			test_data = self.valid_post_data[0]
			response = self.post([test_data])
			payload = response.get_json()
			self.assert200(response)
			self.assertTrue(payload['request_had_errors'])
			self.assertTrue('unique' in payload['data'][0]['error'].lower())
			self.assertFalse(payload['data'][0]['modified_ok'])
			

	def test_bad_post_null(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			# You need to copy otherwise input data for the rest of tests will also be 
			# modified.
			test_data = self.valid_post_data[0].copy()
			for key in test_data.keys():
				if key != 'dt_index':
					test_data[key] = None

			response = self.post([test_data])
			self.assert200(response)
			payload = response.get_json()
			self.assertTrue(payload['request_had_errors'])
			

	def test_successful_multiple_put(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)
			instance = self.obj.query.first()
			table_pk = instance.get_pk()

			req_payload = []
			for indx, row in enumerate(self.valid_put_data):
				instance_id = row[table_pk]
				instance = self.obj.query.get(instance_id)
				row['dt_index'] = indx
				row['ludate'] = instance.to_timestamp('ludate')
				req_payload.append(row)

			response = self.put(req_payload)
			payload = response.get_json()
			self.assert200(response)
			self.assertFalse(payload['request_had_errors'])


	def test_successful_single_put(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)

			test_data = self.valid_put_data[0]
			instance = self.obj.query.first()
			table_pk = instance.get_pk()

			instance_pk = test_data[table_pk]
			instance = self.obj.query.get(instance_pk)
			
			test_data['dt_index'] = 0
			test_data['ludate'] = instance.to_timestamp('ludate')

			response = self.put([test_data])
			payload = response.get_json()
			self.assert200(response)
			self.assertFalse(payload['request_had_errors'])
			
	def test_put_outdated_timestamp(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)

			test_data = self.valid_put_data[0]
			instance = self.obj.query.first()
			table_pk = instance.get_pk()

			instance_pk = test_data[table_pk]
			instance = self.obj.query.get(instance_pk)
			
			outdated_timestamp = instance.to_timestamp('ludate')
			
			# Sleeping is important because otherwise it'll do the test so fast that
			# it won't recognize the error.
			time.sleep(1)

			for col, val in test_data.items():
				if col != table_pk:
					setattr(instance, col, val)

			db.session.add(instance)
			db.session.commit()

			test_data['dt_index'] = 0
			test_data['ludate'] = outdated_timestamp

			response = self.put([test_data])
			payload = response.get_json()
			
			# 200 Status because we handled it successfully
			self.assert200(response)
			self.assertTrue(payload['request_had_errors'])
			self.assertIsNotNone(payload['data'][0]['error'])

	def test_successful_single_post(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			test_data = self.valid_post_data[0]
			response = self.post([test_data])
			payload = response.get_json()

			self.assert200(response)
			print('payload is {}'.format(payload))
			self.assertFalse(payload['request_had_errors'])
			


	def test_successful_multiple_post(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			response = self.post(self.valid_post_data)
			payload = response.get_json()


			self.assert200(response)
			self.assertFalse(payload['request_had_errors'])

	def test_successful_single_delete(self):

		with self.client:
			# Logging in and creating the data
			self.login_user(self.admin_email, self.admin_password)
			self.post(self.valid_post_data)
			instance = self.obj.query.first()
			self.assertIsNotNone(instance)
			
			response = self.delete([{'dt_index': 0, instance.get_pk(): getattr(instance, instance.get_pk()),
				'ludate': instance.to_timestamp('ludate')}])
			self.assert200(response)
			payload = response.get_json()
			self.assertFalse(payload['request_had_errors'])
			self.assertTrue(payload['data'][0]['modified_ok'])

	def test_successful_multiple_delete(self):

		with self.client:
			# Logging in and creating the data
			self.login_user(self.admin_email, self.admin_password)
			self.post(self.valid_post_data)
			instances = self.obj.query.all()
			self.assertIsNotNone(instances)

			req_payload = []
			for indx, instance in enumerate(instances):
				req_payload.append({'dt_index': indx, instance.get_pk(): getattr(instance, instance.get_pk()),
					'ludate': instance.to_timestamp('ludate')})

			response = self.delete(req_payload)
			self.assert200(response)
			payload = response.get_json()
			self.assertFalse(payload['request_had_errors'])
			
			instance = self.obj.query.first()
			self.assertIsNone(instance)
	
	





class TestCustomerEditReference(TestEditReference, BaseEditReferenceTests):

	route = '/editref/customer'
	obj = Customer
	
	valid_post_data = [{'customerid': 0, 'customername': customer, 'dt_index': 0} for customer in 
		['my first customer', 'my second customer', 'my third customer']]

	valid_put_data = [{'customerid': 1, 'customername': 'UPDATED FIRST CUSTOMER'}, {'customerid': 2, 'customername': 'UPDATED SECOND CUSTOMER'}]

	# def test_successful_delete_customer(self):

	# 	with self.client:
	# 		login_response = self.login_user('admin@example.com', 'password1', follow_redirects=True)
	# 		response = self.post(self.valid_post_data)
	# 		customer = Customer.query.first()
	# 		response = self.delete([{'dt_index': 0, 'customerid': customer.customerid, 'ludate': customer.to_timestamp('ludate')}])
	# 		# print('response.status_code is {}'.format(response.status_code))
	# 		# print('response.get_json() is {}'.format(response.get_json()))
	# 		payload = response.get_json()
	# 		self.assertFalse(payload['request_had_errors'])
	# 		self.assertTrue(payload['data'][0]['modified_ok'])
	# 		self.assert200(response)



