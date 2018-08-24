from tests.base import BaseTestCase
import unittest
import json
import os
from app import db
from app.models import Product, Customer, PriceRequestStatus, PriceRequest
from app.data import create_data, create_price_requests

class TestApi(BaseTestCase):

	def test_environ_has_token(self):

		self.assertIsNotNone(os.environ.get('SLACK_AUTH_TOKEN'))

	def test_post_approve_twice(self):

		self.create_price_request()
		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = data['post_route']

			response = self.client.post(post_route, headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN'),
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[0]}))

			self.assertTrue(response.status_code == 200)
			self.assertTrue(response.get_json()['error_message'] is None)

			response = self.client.post(post_route, headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN'),
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[0]}))

			self.assertTrue(response.status_code == 400)
			self.assertTrue(response.get_json()['error_message'] is not None)


	def test_post_bad_id_in_url(self):

		self.create_price_request()
		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = data['post_route']

			response = self.client.post('/api/pricerequest/post/400', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN'),
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[1]}))

			self.assertTrue(response.status_code == 400)
			self.assertTrue(response.get_json()['error_message'] is not None)

	def test_post_no_token(self):

		self.create_price_request()
		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = data['post_route']

			response = self.client.post(post_route, headers={
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[1]}))

			
			self.assertTrue(response.status_code == 403)
			self.assertTrue(response.get_json()['error_message'] is not None)
			

	def test_post_deny_price_request(self):

		self.create_price_request()
		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = data['post_route']

			response = self.client.post(post_route, headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN'),
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[1]}))

			self.assertTrue(response.status_code == 200)
			self.assertTrue(response.get_json()['error_message'] is None)

	def test_post_approve_price_request(self):

		self.create_price_request()
		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
			
			data = response.get_json()
			price_request = data['price_request']
			actions = data['actions']
			post_route = data['post_route']

			response = self.client.post(post_route, headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN'),
				'content-type': 'application/json'
				}, data=json.dumps({'action': actions[0]}))

			self.assertTrue(response.status_code == 200)
			self.assertTrue(response.get_json()['error_message'] is None)
			

	def create_price_request(self):

		create_data(Product, Customer, db, PriceRequestStatus)
		create_price_requests(PriceRequest, Product, Customer, db)

	def test_successful_get_outstanding_requests(self):

		self.create_price_request()
		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
			
			data = response.get_json()
			self.assertTrue('actions' in data)
			self.assertTrue('post_route' in data)
			self.assertTrue('price_request' in data)
			self.assertTrue(response.status_code == 200)
			

	def test_successful_get_no_outstanding_requests(self):
		"""
		Expects 200 status code, but an error message due to not having any 
		price requests in the database
		"""

		with self.client:
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': os.environ.get('SLACK_AUTH_TOKEN')})
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
			response = self.client.get('/api/pricerequest/get', headers={
				'X-SLACK-AUTH-TOKEN': 'BAD_TOKEN_VALUE'})
			self.assertTrue(response.status_code == 403)
			self.assertTrue('error_message' in response.get_json())
			self.assertTrue('X-SLACK-AUTH-TOKEN' in response.get_json()['error_message'])



if __name__ == "__main__":
	unittest.main()