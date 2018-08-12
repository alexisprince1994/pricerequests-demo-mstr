from flask import Flask, session, flash
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from .models import db, User

bcrypt = Bcrypt()
login_manager = LoginManager()

@login_manager.user_loader
def user_loader(id):
	return User.query.get(id)

def create_app(config_object):

	app = Flask(__name__, template_folder='../static', static_folder='../static/dist')
	app.config.from_object(config_object)

	db.init_app(app)
	bcrypt.init_app(app)
	login_manager.init_app(app)

	from server.user.views import users
	from server.pricerequests.views import pricerequest
	from server.homepage.views import homepage
	from server.api.views import api
	app.register_blueprint(users)
	app.register_blueprint(pricerequest)
	app.register_blueprint(homepage)
	app.register_blueprint(api)
	login_manager.login_view = 'users.login'

	return app

app = create_app('server.config.DevelopmentConfig')