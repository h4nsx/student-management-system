.PHONY: help setup db-up db-down init-db dev clean

help: ## Show this help message
	@echo 'Usage:'
	@echo '  make <target>'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## First-time setup: install dependencies and setup .env
	@echo "Installing dependencies..."
	npm install
	@if [ ! -f .env ]; then \
		echo "Copying .env.example to .env..."; \
		cp .env.example .env; \
		echo "Please update your .env file as needed."; \
	else \
		echo ".env already exists."; \
	fi

db-up: ## Start the PostgreSQL database using Docker
	@echo "Starting database container..."
	docker compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 3

db-down: ## Stop and remove the PostgreSQL database container
	docker compose down

init-db: db-up ## Run the initialization SQL script against the database
	@echo "Initializing database schema..."
	@docker exec -i student_management_db psql -U postgres -d student_management < init.sql
	@echo "Database initialized."

dev: setup init-db ## Start the database, apply schema, and start the development server
	@echo "Starting development server..."
	npm run dev

clean: db-down ## Stop DB and remove node_modules
	rm -rf node_modules
