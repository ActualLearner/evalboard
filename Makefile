.PHONY: install create-venv migrate seed run-backend run-frontend dev setup

create-venv:
	cd backend && python -m venv venv

install:
	cd backend && venv/bin/pip install -r requirements.txt
	cd frontend && npm install

migrate:
	cd backend && venv/bin/python manage.py migrate

seed:
	cd backend && venv/bin/python manage.py seed

run-backend:
	cd backend && venv/bin/python manage.py runserver

run-frontend:
	cd frontend && npm run dev

dev:
	make run-backend & \
	make run-frontend & \
	wait

setup: create-venv install migrate seed
