import os


class ProductionConfig(object):

	DEBUG = False
	TESTING = False
	SQLALCHEMY_TRACK_MODIFICATIONS = False
	SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
	SECRET_KEY = 'secret key'
	WTF_CSRF_SECRET_KEY = 'second secret key'
	SECURITY_PASSWORD_SALT = 'super salty'
	
	

class DevelopmentConfig(ProductionConfig):

	DEBUG = True
	# When doing work on static js files, template reload
	# is needed to see those changes.
	TEMPLATES_AUTO_RELOAD = True
	SEND_FILE_MAX_AGE_DEFAULT = 0
	SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'

class SqlDebuggingConfig(DevelopmentConfig):

	SQLALCHEMY_ECHO = True

class TestingConfig(ProductionConfig):

	TESTING = True
	WTF_CSRF_CHECK_DEFAULT = False
	LOGIN_DISABLED = True
