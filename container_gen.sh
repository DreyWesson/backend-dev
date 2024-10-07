#!/bin/bash

# Function to prompt the user for input with a default value
prompt() {
  local var_name="$1"
  local prompt_text="$2"
  local default_value="$3"
  local user_input

  read -p "$prompt_text [$default_value]: " user_input
  eval "$var_name='${user_input:-$default_value}'"
}

# Function to append service configuration to docker-compose.yml
append_to_yaml() {
  local yaml_file="docker-compose.yml"

  # Create a backup of the original file
  [ -f "$yaml_file" ] && cp "$yaml_file" "$yaml_file.bak"

  # Check if the file exists; if not, create it with initial structure
  if [ ! -f "$yaml_file" ]; then
    echo "Creating a new docker-compose.yml file..."
    echo "version: '3.9'" > "$yaml_file"
    echo "services:" >> "$yaml_file"
  fi

  # Append the service configuration to the YAML file
  cat <<EOF >> "$yaml_file"
  $service_name:
    build:
      context: $build_context
      dockerfile: $dockerfile
    container_name: $container_name
    ports:
      - "$host_port:$container_port"
    env_file:
      - $env_file
    volumes:
      - $host_volume:$container_volume
    command: $start_command
    networks:
      - $network_name
    depends_on:
      - mongo
      - psql
    logging:
      driver: "$log_driver"
      options:
        max-size: "$log_max_size"
        max-file: "$log_max_file"
EOF

  echo "Service configuration for '$service_name' has been successfully added to '$yaml_file'."
}

# Prompt user for service configuration values
echo "Creating a new Docker Compose service configuration..."
prompt service_name "Service name" "app"
prompt build_context "Build context path" "./backend"
prompt dockerfile "Dockerfile name" "Dockerfile"
prompt container_name "Container name" "$service_name"
prompt host_port "Host port" "80"
prompt container_port "Container port" "80"
prompt env_file "Environment file path" "./backend/.env"
prompt host_volume "Host volume path" "./backend"
prompt container_volume "Container volume path" "/app"
prompt start_command "Start command" "npm run start:dev"
prompt network_name "Network name" "laser-network"
prompt log_driver "Logging driver" "json-file"
prompt log_max_size "Log max size" "10m"
prompt log_max_file "Log max file" "3"

# Append the configuration to docker-compose.yml
append_to_yaml
