# Resume Generator Makefile
# Provides easy commands to manage the Docker-based application

.PHONY: help build up down restart logs clean db-setup db-reset dev prod

# Default target
help: ## Show this help message
	@echo "Resume Generator - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	docker compose up -d postgres redis
	@echo "⏳ Waiting for database to be ready..."
	@sleep 5
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🌐 Starting development server..."
	npm run dev

# Production commands
build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	docker compose build

up: ## Start all services in production mode
	@echo "🚀 Starting production environment..."
	docker compose up -d
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ Application is running at http://localhost:25925"
	@echo "💡 Run 'make db-setup' if this is the first time or you need to reset the database"

down: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker compose down

restart: ## Restart all services
	@echo "🔄 Restarting services..."
	docker compose restart

# Database commands
db-setup: ## Setup database (migrate and seed) - run this only once or when you want to reset
	@echo "🗄️ Setting up database..."
	@echo "⚠️  This will reset your database data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose exec app npm run db:push
	docker compose exec app npm run db:seed
	@echo "✅ Database setup complete!"

db-reset: ## Reset database (drop, recreate, and seed)
	@echo "⚠️  Resetting database..."
	@echo "⚠️  This will delete all your data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose exec app npx prisma migrate reset --force
	docker compose exec app npm run db:seed
	@echo "✅ Database reset complete!"

db-backup: ## Create a database backup
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker compose exec postgres pg_dump -U leon resume > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Database backup created in ./backups/"

db-restore: ## Restore database from backup (requires BACKUP_FILE variable)
	@echo "🔄 Restoring database from backup..."
	@if [ -z "$(BACKUP_FILE)" ]; then echo "❌ Please specify BACKUP_FILE=filename.sql"; exit 1; fi
	@docker compose exec -T postgres psql -U leon -d resume < backups/$(BACKUP_FILE)
	@echo "✅ Database restored from $(BACKUP_FILE)"

db-studio: ## Open Prisma Studio
	@echo "🎨 Opening Prisma Studio..."
	docker compose exec app npm run db:studio

# Logging and monitoring
logs: ## Show logs from all services
	docker logs -f

logs-app: ## Show logs from app service only
	docker logs -f app

logs-db: ## Show logs from database service only
	docker logs -f postgres

# Maintenance commands
clean: ## Clean up Docker resources
	@echo "🧹 Cleaning up Docker resources..."
	docker compose down -v
	docker system prune -f

clean-all: ## Clean up all Docker resources (including images)
	@echo "🧹 Cleaning up all Docker resources..."
	docker compose down -v --rmi all
	docker system prune -af

# Status and health checks
status: ## Show status of all services
	@echo "📊 Service Status:"
	docker compose ps

health: ## Check health of services
	@echo "🏥 Health Check:"
	@echo "App: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost:25925 || echo 'DOWN')"
	@echo "Database: $$(docker compose exec postgres pg_isreadymake d -U postgres > /dev/null 2>&1 && echo 'UP' || echo 'DOWN')"

# Backup and restore
backup: ## Backup database
	@echo "💾 Creating database backup..."
	docker compose exec postgres pg_dump -U postgres resume_gen > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

restore: ## Restore database from backup (usage: make restore BACKUP_FILE=backup.sql)
	@echo "📥 Restoring database from $(BACKUP_FILE)..."
	docker compose exec -T postgres psql -U leon resume < $(BACKUP_FILE)
	@echo "✅ Database restored"

# Environment setup
env-example: ## Create .env.example file
	@echo "📝 Creating .env.example file..."
	@echo "# Database" > .env.example
	@echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/resume_gen\"" >> .env.example
	@echo "" >> .env.example
	@echo "# OpenAI" >> .env.example
	@echo "OPENAI_API_KEY=\"your_openai_api_key_here\"" >> .env.example
	@echo "" >> .env.example
	@echo "# WorkOS (for authentication)" >> .env.example
	@echo "WORKOS_CLIENT_ID=\"your_workos_client_id\"" >> .env.example
	@echo "WORKOS_CLIENT_SECRET=\"your_workos_client_secret\"" >> .env.example
	@echo "WORKOS_REDIRECT_URI=\"http://localhost:25925/callback\"" >> .env.example
	@echo "" >> .env.example
	@echo "# NextAuth" >> .env.example
	@echo "NEXTAUTH_SECRET=\"your_nextauth_secret_here\"" >> .env.example
	@echo "NEXTAUTH_URL=\"http://localhost:25925\"" >> .env.example
	@echo "✅ .env.example created"

# Quick start commands
quick-start: ## Quick start for new users
	@echo "🚀 Quick Start - Resume Generator"
	@echo "1. Copy environment file..."
	@cp .env.example .env 2>/dev/null || echo "⚠️  Please create .env file from .env.example"
	@echo "2. Starting services..."
	@$(MAKE) up
	@echo "3. Setting up database (first time only)..."
	@$(MAKE) db-setup
	@echo ""
	@echo "✅ Application is ready!"
	@echo "🌐 Main App: http://localhost:25925"
	@echo "⚙️  Admin Portal: http://localhost:25925/admin"
	@echo "🗄️  Database: localhost:5432 (postgres/postgres)"

# Development workflow
dev-reset: ## Reset development environment
	@echo "🔄 Resetting development environment..."
	@$(MAKE) down
	@$(MAKE) dev

# Production deployment
deploy: ## Deploy to production
	@echo "🚀 Deploying to production..."
	@$(MAKE) build
	@$(MAKE) up
	@echo "✅ Production deployment complete!"

# Security
security-scan: ## Run security scan
	@echo "🔒 Running security scan..."
	docker compose exec app npm audit
	docker compose exec app npx prisma validate

# Monitoring
monitor: ## Monitor application resources
	@echo "📊 Application Resources:"
	docker stats --no-stream

# Update dependencies
update: ## Update dependencies
	@echo "📦 Updating dependencies..."
	docker compose exec app npm update
	docker compose exec app npx prisma generate
	@echo "✅ Dependencies updated"
