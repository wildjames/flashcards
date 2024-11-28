.PHONY: run-backend-dev run-frontend-dev lint-backend lint-frontend lint install-backend install-frontend install clean-backend clean-frontend clean

# Directories
BACKEND_DIR := /workspaces/nhs-flashcards/nhs-flashcards-backend
FRONTEND_DIR := /workspaces/nhs-flashcards/nhs-flashcards-frontend

# Python virtual environment
VENV_DIR := $(BACKEND_DIR)/venv
PYTHON := python3
PIP := $(VENV_DIR)/bin/pip

# Backend commands
install-backend:
	cd $(BACKEND_DIR) && \
		$(PYTHON) -m venv venv && \
		$(VENV_DIR)/bin/pip install --upgrade pip && \
		$(VENV_DIR)/bin/pip install -r requirements.txt

run-backend-dev:
	cd $(BACKEND_DIR) && \
		export FLASK_APP=app.py; \
		export FLASK_ENV=development; \
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
		npm install

run-frontend-dev:
	cd $(FRONTEND_DIR) && \
		npm run dev

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
