from server import app, bcrypt
from server.models import db, Customer, Category, Product, User, PriceRequestStatus
from server.data import create_data

if __name__ == "__main__":
	with app.app_context():
		db.create_all()

		try:
			create_data(Category, Product, Customer, db, PriceRequestStatus)
			hashed_password = bcrypt.generate_password_hash('password1').decode('utf-8')
			admin = User(username='admin', email='admin@example.com', password=hashed_password, active=True, read_only=False)
			db.session.add(admin)
			db.session.commit()
		except: 
			pass
			
	app.run()