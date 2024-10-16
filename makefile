DOCKER_COMPOSE = docker-compose -f docker-compose.yml -f docker-compose.database.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml -f docker-compose.logging.yml

SERVICE ?= all

build:
	@echo "Building and starting service: $(SERVICE)"
	@$(DOCKER_COMPOSE) up --build --no-deps $(SERVICE)

build-all:
	@echo "Building and starting all services"
	@$(DOCKER_COMPOSE) up --build

down:
	@echo "Cleaning up containers"
	@$(DOCKER_COMPOSE) down -v

prune:
	@echo "Stopping all services gracefully"
	@$(DOCKER_COMPOSE) stop
	@echo "Cleaning up containers"
	@$(DOCKER_COMPOSE) down -v
	@echo "Destroying All Containers and Unused Images"
	@docker system prune -af

restart:
	@echo "Restarting service: $(SERVICE)"
	@$(DOCKER_COMPOSE) restart $(SERVICE)

rebuild:
	@echo "Rebuilding and restarting service: $(SERVICE)"
	@$(DOCKER_COMPOSE) up --build --force-recreate --no-deps $(SERVICE)

stop:
	@echo "Stopping all services gracefully"
	@$(DOCKER_COMPOSE) stop

up:
	@echo "Running all services"
	@$(DOCKER_COMPOSE) up

