from flask import url_for
import time
import logging
import datetime
import unittest
import json
import os
from app import create_app, db, bcrypt
from app.models import User, Customer, Product
from flask_testing import TestCase

logging.basicConfig(level=logging.INFO)

class TestEditReference(TestCase):

	admin_email = 'admin@example.com'
	admin_password = 'password1'

	def create_app(self):
		"""
		Creates an instances of the application w/ testing config.
		"""
		app = create_app('app.config.TestingConfig')
		
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

	def get(self, query_string):

		return self.client.get(self.route, query_string=query_string)

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
		Creates the database and tables, as well as an admin user.
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

	def test_get_all_records(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)

			response = self.get({'filter[]': ['all']})
			payload = response.get_json()

			db_rows = self.obj.query.count()
			self.assertEqual(len(payload), db_rows)

	def test_bad_post_non_unique(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			logging.debug('login_response from test_bad_post_non_unique is {}'.format(login_response))

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
			

	def test_bad_single_put_to_null(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)

			test_data = self.valid_put_data[0].copy()
			instance = self.obj.query.first()
			table_pk = instance.get_pk()

			for key, val in test_data.items():
				if key != table_pk:
					test_data[key] = None

			instance_pk = test_data[table_pk]
			instance = self.obj.query.get(instance_pk)
			
			test_data['dt_index'] = 0
			test_data['ludate'] = instance.to_timestamp('ludate')

			response = self.put([test_data])
			payload = response.get_json()
			self.assert200(response)
			self.assertTrue(payload['request_had_errors'])
	
	def test_put_one_good_one_bad(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			self.post(self.valid_post_data)

			test_data = self.valid_put_data[0].copy()
			instance = self.obj.query.first()
			self.assertIsNotNone(instance)
			table_pk = instance.get_pk()

			for key, val in test_data.items():
				if key != table_pk:
					test_data[key] = None

			instance_pk = test_data[table_pk]
			instance = self.obj.query.get(instance_pk)
			
			test_data['dt_index'] = 0
			test_data['ludate'] = instance.to_timestamp('ludate')

			good_update = self.valid_put_data[1].copy()
			instance_pk = good_update[table_pk]
			instance = self.obj.query.get(instance_pk)
			good_update['dt_index'] = 1
			good_update['ludate'] = instance.to_timestamp('ludate')
			self.assertIsNotNone(instance)

			response = self.put([test_data, good_update])
			payload = response.get_json()
			self.assert200(response)
			self.assertTrue(payload['request_had_errors'])
			logging.info('payload from one good one bad is {}'.format(payload))

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
			self.assertFalse(payload['request_had_errors'])

	def test_successful_multiple_post(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password, follow_redirects=True)
			response = self.post(self.valid_post_data)
			payload = response.get_json()


			self.assert200(response)
			self.assertFalse(payload['request_had_errors'])

	def test_delete_outdated_timestamp(self):

		with self.client:
			login_response = self.login_user(self.admin_email, self.admin_password)
			self.post(self.valid_post_data)

			
			instance = self.obj.query.first()
			self.assertIsNotNone(instance)

			test_data = self.valid_post_data[0].copy()

			
			
			# Sleeping is important because otherwise it'll do the test so fast that
			# it won't recognize the error.
			time.sleep(1)

			test_data['dt_index'] = 0
			test_data['ludate'] = datetime.datetime.now().timestamp()

			response = self.put([test_data])
			payload = response.get_json()
			
			# 200 Status because we handled it successfully
			self.assert200(response)
			self.assertTrue(payload['request_had_errors'])
			self.assertIsNotNone(payload['data'][0]['error'])		


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
	

class TestCustomerEditReference(BaseEditReferenceTests, TestEditReference):

	route = '/editref/customer'
	obj = Customer
	
	valid_post_data = [{'customerid': 0, 'customername': customer, 'dt_index': 0} for customer in 
		['my first customer', 'my second customer', 'my third customer']]

	valid_put_data = [{'customerid': 1, 'customername': 'UPDATED FIRST CUSTOMER'}, {'customerid': 2, 'customername': 'UPDATED SECOND CUSTOMER'}]

class TestProductEditReference(BaseEditReferenceTests, TestEditReference):

	route = '/editref/product'
	obj = Product

	valid_post_data = [{'productid': 0, 'productname': 'my first product', 'price': 12.5, 'cost': 10, 'dt_index': 0},
		{'productid': 0, 'productname': 'my second product', 'price': 15, 'cost': 7, 'dt_index': 1},
		{'productid': 0, 'productname': 'my third product', 'price': 2000, 'cost': 150, 'dt_index': 2}]

	valid_put_data = [{'productid': 1, 'productname': 'MY UPDATED FIRST PRODUCT', 'price': 12.5, 'cost': 10, 'dt_index': 0},
		{'productid': 2, 'productname': 'my second product', 'price': 90, 'cost': 7, 'dt_index': 1},
		{'productid': 3, 'productname': 'MY UPDATED THIRD PRODUCT', 'price': 16, 'cost': 4, 'dt_index': 2}]	
