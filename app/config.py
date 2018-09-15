import os


class ProductionConfig(object):

	DEBUG = False
	TESTING = False
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
	SECRET_KEY = os.environ.get('SECRET_KEY')
	WTF_CSRF_SECRET_KEY = os.environ.get('CSRF_SECRET_KEY')
	SECURITY_PASSWORD_SALT = os.environ.get('PASSWORD_KEY')
	
	

class DevelopmentConfig(ProductionConfig):

	DEBUG = True
	# When doing work on static js files, template reload
	# is needed to see those changes. Templates won't need to 
	# necessarily change, but the static JS files attached
	# to them do.
	SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///test.db'
	SECRET_KEY = 'secret key'
	WTF_CSRF_SECRET_KEY = 'second secret key'
	SECURITY_PASSWORD_SALT = 'super salty'

class SqlDebuggingConfig(DevelopmentConfig):

	SQLALCHEMY_ECHO = True

class TestingConfig(DevelopmentConfig):

	
	RENDER_TEMPLATES = False
	WTF_CSRF_ENABLED = False
	SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
