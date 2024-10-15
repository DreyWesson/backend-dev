DOCKER_COMPOSE = docker-compose -f docker-compose.yml -f docker-compose.database.yml -f docker-compose.backend.yml -f docker-compose.frontend.yml -f docker-compose.logging.yml

SERVICE ?= all

restart:
	@echo "Restarting service: $(SERVICE)"
	@$(DOCKER_COMPOSE) restart $(SERVICE)

build:
	@echo "Building and starting service: $(SERVICE)"
	@$(DOCKER_COMPOSE) up --build --no-deps $(SERVICE)

run:
	@echo "Running all services"
	@$(DOCKER_COMPOSE) up

build-all:
	@echo "Building and starting all services"
	@$(DOCKER_COMPOSE) up --build

clean:
	@echo "Cleaning up containers"
	@$(DOCKER_COMPOSE) down -v

fclean:
	@echo "Destroying All Containers"
	@docker system prune -a -f