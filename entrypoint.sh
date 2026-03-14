#!/bin/sh

# If any command fails, the script exits immediately
set -e

echo "Waiting for PostgreSQL..."

# We use 'nc' (netcat) to check if the db port is open
# 'db' is the name of the service in our docker-compose.yml
while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL started!"

# Execute the command passed to the docker container (e.g., runserver or worker)
exec "$@"