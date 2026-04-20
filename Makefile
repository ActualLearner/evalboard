.PHONY: install migrate seed run-backend run-frontend run dev

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

migrate:
	cd backend && python manage.py migrate

seed:
	cd backend && python manage.py seed

run-backend:
	cd backend && python manage.py runserver

run-frontend:
	cd frontend && npm run dev

dev:
	make run-backend & make run-frontend

setup:
	make install
	make migrate
	make seed
