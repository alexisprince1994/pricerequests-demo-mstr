from flask_script import Manager
from app import app, db, models
import unittest

manager = Manager(app)

@manager.command
def test():
	"""
	Runs tests without coversage
	"""
	tests = unittest.TestLoader().discover('tests', pattern='test*.py')
	result = unittest.TextTestRunner(verbosity=1).run(tests)
	if result.wasSuccessful():
		return 0
	return 1

if __name__ == "__main__":
	manager.run()