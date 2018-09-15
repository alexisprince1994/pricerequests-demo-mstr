from flask import url_for
from flask_login import current_user
from app.user.forms import RegistrationForm
import unittest
import json
import os
from app import app, db, bcrypt
from app.models import User
from flask_testing import TestCase

class TestUserAuth(TestCase):

	def create_app(self):
		"""
		Creates an instances of the application w/ testing config.
		"""
		app.config.from_object('app.config.TestingConfig')
		return app
	
	@classmethod
	def setUpClass(cls):

		db.create_all()
		db.session.commit()
		cls.test_user = User(username='TEST', 
			email='admin@example.com', 
			password=bcrypt.generate_password_hash('password1').decode('utf-8'),
			read_only=False, active=True)
		db.session.add(cls.test_user)
		db.session.commit()

	@classmethod
	def tearDownClass(cls):
		"""
		Drops database tables and remove session
		"""

		db.session.remove()
		db.drop_all()

	def login_user(self, email, password):

		return self.client.post(url_for('users.login'), data={
			'email': email, 'password': password
			})

	def register_user(self, username, email, password):

		return self.client.post(url_for('users.register'), data={
			'username': username, 'email': email, 'password': password,
			'confirm_password': password
			}, follow_redirects=True)

	def test_existing_user_can_login(self):

		with self.client:
			self.login_user('admin@example.com', 'password1')
			# self.assertEqual(response.status_code, 200)
			self.assertTrue(current_user.email == 'admin@example.com')
			self.assertFalse(current_user.is_anonymous)

	def test_validate_successful_register_form(self):

		form = RegistrationForm(
			email='test530@test.com',
			password='hunter2',
			username='test user 200',
			confirm_password='hunter2'
			)

		self.assertTrue(form.validate())

	def test_validate_missing_email_form(self):

		form = RegistrationForm(
			email='',
			password='hunter2',
			username='test user 200',
			confirm_password='hunter2'
			)

		self.assertFalse(form.validate())
	
	def test_validate_missing_password_form(self):

		form = RegistrationForm(
			email='test530@test.com',
			password='',
			username='test user 200',
			confirm_password='hunter2'
			)

		self.assertFalse(form.validate())

	def test_successful_register(self):

		with self.client:
			response = self.register_user('TEST2', 'test@example.com',
				'password2')
			user = User.query.filter_by(email='test@example.com').first()
			self.assertIsNotNone(user, 'User registration failed.')
			self.assertEqual(response.status_code, 200)
			
	def test_bad_password(self):

		with self.client:
			
			result = self.register_user('test username', 'admin@example.com',
				'password')
			self.assertEqual(1, User.query.count(), 'A bad registration went through.')


	def test_existing_email(self):

		with self.client:
			user_1 = self.register_user('test username', 'admin4@example.com',
					'password1')

			user_2 = self.register_user('test username', 'admin4@example.com',
					'password1')

			self.assertEqual(2, User.query.count())
	