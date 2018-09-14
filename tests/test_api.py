from tests.base import BaseTestCase
import unittest
import json
import os
from app import app
from app import db
from app.models import Product, Customer, PriceRequestStatus, PriceRequest
from app.data import create_data, create_price_requests
from flask_testing import TestCase

class TestApi(TestCase):

	post_route = '/api/pricerequest/post/'

	def create_app(self):
		"""
		Creates an instances of the application w/ testing config.
		"""
		app.config.from_object('app.config.TestingConfig')
		return app

	def setUp(self):

		db.create_all()
		db.session.commit()
		create_data(Product, Customer, db, PriceRequestStatus)
		create_price_requests(PriceRequest, Product, Customer, db)

		db.session.commit()

	def tearDown(self):
		"""
		Drops database tables and remove session
		"""

		db.session.remove()
		db.drop_all()
	
	def get_price_requests(self, token=None):
		"""
		If token is none, the environment variable is used. This is so
		we can also test with differing tokens.
		:param token: str
		"""	

		if token is None:
			token = os.environ.get('SLACK_AUTH_TOKEN')

		return self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': token})

	def post_price_request(self, route, action, token=None):

		if token is None:
			token = os.environ.get('SLACK_AUTH_TOKEN')

		return self.client.post(route, headers={'X-SLACK-AUTH-TOKEN': token,
			'content-type': 'application/json'}, data=json.dumps({'action': action}))


	def test_environ_has_token(self):

		self.assertIsNotNone(os.environ.get('SLACK_AUTH_TOKEN'))

	def test_post_approve_twice(self):

		
		with self.client:
			
			response = self.get_price_requests()
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = self.post_route + str(price_request['id'])

			response = self.post_price_request(post_route, actions[0])
			self.assertTrue(response.status_code == 204)
			self.assertIsNone(response.get_json())

			response = self.post_price_request(post_route, actions[0])
			
			self.assertTrue(response.status_code == 400)
			self.assertTrue(response.get_json()['error_message'] is not None)


	def test_post_bad_id_in_url(self):

		
		with self.client:

			response = self.get_price_requests()
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			# This is just an example of a bad ID, theoretically this should
			# pass with any id that isn't between 1 and 10.
			post_route = self.post_route + '400'

			# Running for both actions to make sure it isn't the actions
			# fault that its failing.
			response = self.post_price_request(post_route, actions[0])
			self.assertTrue(response.status_code == 400)
			self.assertTrue(response.get_json()['error_message'] is not None)

			response = self.post_price_request(post_route, actions[1])
			self.assertTrue(response.status_code == 400)
			self.assertTrue(response.get_json()['error_message'] is not None)

	def test_post_no_token(self):

		
		with self.client:
			response = self.get_price_requests()
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = self.post_route + str(price_request['id'])

			response = self.client.post(post_route, headers={
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[1]}))

			
			self.assertTrue(response.status_code == 403)
			self.assertTrue(response.get_json()['error_message'] is not None)
			

	def test_post_deny_price_request(self):

		
		with self.client:
			response = self.get_price_requests()
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = self.post_route + str(price_request['id'])

			response = self.post_price_request(post_route, actions[1])
			self.assertTrue(response.status_code == 204)
			self.assertIsNone(response.get_json())
			

	def test_post_approve_price_request(self):

		
		with self.client:
			response = self.get_price_requests()
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = self.post_route + str(price_request['id'])

			response = self.post_price_request(post_route, actions[0])
			
			self.assertTrue(response.status_code == 204)
			self.assertIsNone(response.get_json())
			
			
	def test_successful_get_outstanding_requests(self):

		
		with self.client:
			response = self.get_price_requests()
			
			data = response.get_json()
			self.assertTrue('actions' in data)
			self.assertTrue('price_request' in data)
			self.assertTrue(response.status_code == 200)
			

	def test_successful_get_no_outstanding_requests(self):
		"""
		Expects 200 status code, but an error message due to not having any 
		price requests in the database
		"""

		# Needs to delete all records in the price request table
		PriceRequest.query.delete()
		db.session.commit()

		with self.client:
			response = self.get_price_requests()
			self.assertTrue(response.status_code == 200)
			self.assertTrue('error_message' in response.get_json())

	def test_get_missing_token(self):
		"""
		Sends a get request without the proper token. 
		Expecting a key that has "error_message", a 403 status, 
		and a message telling the user which proper key they should attach their token to.
		"""

		with self.client:
			response = self.client.get('/api/pricerequest/get')
			self.assertTrue(response.status_code == 403)
			self.assertTrue('error_message' in response.get_json())
			self.assertTrue('X-SLACK-AUTH-TOKEN' in response.get_json()['error_message'])

	def test_get_bad_token(self):

		"""
		Sends a get request with a token in the correct place, 
		but an invalid token. 
		"""

		with self.client:
			response = self.get_price_requests('BAD TOKEN')
			self.assertTrue(response.status_code == 403)
			self.assertTrue('error_message' in response.get_json())
			self.assertTrue('X-SLACK-AUTH-TOKEN' in response.get_json()['error_message'])



if __name__ == "__main__":
	unittest.main()