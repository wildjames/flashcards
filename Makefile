.PHONY: run-backend-dev run-frontend-dev lint-backend lint-frontend lint install-backend install-frontend install clean-backend clean-frontend clean

# Directories
BACKEND_DIR := /workspaces/flashcards/flashcard-backend
FRONTEND_DIR := /workspaces/flashcards/flashcard-frontend

# Python virtual environment
VENV_DIR := $(BACKEND_DIR)/venv
PYTHON := python3
PIP := $(VENV_DIR)/bin/pip
SHELL := /bin/bash

# Backend commands
create-db:
	source .env && \
		cd $(BACKEND_DIR) && \
		$(VENV_DIR)/bin/flask db init

migrate:
	source .env && \
		cd $(BACKEND_DIR) && \
		$(VENV_DIR)/bin/flask db migrate && \
		$(VENV_DIR)/bin/flask db upgrade

install-backend:
	source .env && \
		cd $(BACKEND_DIR) && \
		$(PYTHON) -m venv venv && \
		$(VENV_DIR)/bin/pip install --upgrade pip && \
		$(VENV_DIR)/bin/pip install -r requirements.txt

run-backend-dev:
	source .env && \
		cd $(BACKEND_DIR) && \
		export FLASK_APP=app.py; \
		export FLASK_ENV=development; \
		echo $(VENV_DIR); \
		$(VENV_DIR)/bin/flask --debug run --host=0.0.0.0

lint-backend:
	cd $(BACKEND_DIR) && \
		$(VENV_DIR)/bin/flake8 .

clean-backend:
	rm -rf $(VENV_DIR)
	find $(BACKEND_DIR) -type d -name '__pycache__' -exec rm -rf {} +

# Frontend commands
install-frontend:
	cd $(FRONTEND_DIR) && \
		npm install --verbose

run-frontend-dev:
	source .env && \
		cd $(FRONTEND_DIR) && \
		npm run dev

build-frontend: install-frontend
	source .env && \
		cd $(FRONTEND_DIR) && \
		npm run build

lint-frontend:
	cd $(FRONTEND_DIR) && \
		npm lint -- --fix

clean-frontend:
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/build

# Combined commands
install: install-backend install-frontend

lint: lint-backend lint-frontend

clean: clean-backend clean-frontend
