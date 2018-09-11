
# Standard Library imports
import os

# External Packages needed
from flask import Flask, session, flash
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy

# Internal Packages are listed below in order to avoid
# circular imports.

app = Flask(__name__, template_folder='./static', static_folder='./static/dist')

# Loading config path from environment variables or defaulting to dev
app_settings = os.environ.get(
	'APP_SETTINGS',
	'app.config.DevelopmentConfig'
)

app.config.from_object(app_settings)
# Initialize extensions

# Flask Sqlalchemy for database
db = SQLAlchemy(app)
# Flask Bcrypt for password hashing
bcrypt = Bcrypt(app)

# Flask Login for login management
login_manager = LoginManager(app)

from .models import User

@login_manager.user_loader
def user_loader(id):
	return User.query.get(id)

# Blueprint imports
from .user.views import users
from .pricerequests.views import pricerequest
from .homepage.views import homepage
from .api.views import api

# Registering blueprints
app.register_blueprint(users)
app.register_blueprint(pricerequest)
app.register_blueprint(homepage)
app.register_blueprint(api)
login_manager.login_view = 'users.login'
