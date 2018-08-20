from flask import Blueprint, url_for, redirect, render_template, flash, request
from app.user.forms import LoginForm, RegistrationForm
from app import login_manager, bcrypt
from app.models import db, User
from flask_login import current_user, login_user, logout_user

users = Blueprint('users', __name__, static_folder='./static/dist', 
	template_folder='./static')

def redirect_home():
	return redirect(url_for('homepage.index'))

@users.route('/register', methods=['GET', 'POST'])
def register():

	if current_user.is_authenticated:
		return redirect_home()

	form = RegistrationForm()
	if form.validate_on_submit():
		hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
		user = User(username=form.username.data, 
			email=form.email.data, password=hashed_password,
			read_only=True, active=True)
		db.session.add(user)
		db.session.commit()

		flash('Account created! You should be able to log in!', 'success')
		return redirect(url_for('users.login'))

	return render_template('register_user.html', title='Register', register_user_form=form)

@users.route('/login', methods=['GET', 'POST'])
def login():

	if current_user.is_authenticated:
		return redirect_home()

	form = LoginForm()
	if form.validate_on_submit():
		user = User.query.filter_by(email=form.email.data).first()
		if user and bcrypt.check_password_hash(user.password, form.password.data):
			login_user(user, remember=form.remember.data)
			next_page = request.endpoint
			return redirect(url_for(next_page)) if next_page else redirect_home()
		else:
			flash('Login unsuccessful. Please check email and password and try again.', 'danger')

	return render_template('login_user.html', title='Login', login_user_form=form)

@users.route('/logout')
def logout():

	logout_user()
	flash('Successfully logged out.', 'success')
	return redirect(url_for('users.login'))
