
# Standard Library imports
import os

# External Packages needed
from flask import Flask, session, flash

# Flask Extensions
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

# Internal Packages are listed below in order to avoid
# circular imports.

# Intializating extensions allowing them to be imported from
# other files

db = SQLAlchemy()
bcrypt = Bcrypt()
csrf = CSRFProtect()
login_manager = LoginManager()
migrate = Migrate()

# Import required after db declaration
from .models import User

@login_manager.user_loader
def user_loader(id):
	return User.query.get(id)

def create_app(config):

	app = Flask(__name__, template_folder='./static', static_folder='./static/dist')

	# Loading config path from environment variables or defaulting to dev
	if config is None:
		config = os.environ.get(
			'APP_SETTINGS',
			'app.config.DevelopmentConfig'
		)

	app.config.from_object(config)
	# Initialize extensions with app object

	# Flask Sqlalchemy for database
	db.init_app(app)
	migrate.init_app(app, db)
	# Flask Bcrypt for password hashing
	bcrypt.init_app(app)

	# Cross Site Request Forgery protection
	csrf.init_app(app)

	# Flask Login for login management
	login_manager.init_app(app)

	# Blueprint imports
	from .user.views import users
	from .pricerequests.views import pricerequest
	from .homepage.views import homepage
	from .api.views import api
	from .editrefs.views import editrefs

	# Registering blueprints
	app.register_blueprint(users)
	app.register_blueprint(pricerequest)
	app.register_blueprint(homepage)
	app.register_blueprint(api)
	app.register_blueprint(editrefs)
	login_manager.login_view = 'users.login'

	return app

app = create_app(None)
