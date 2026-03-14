#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting Web Service"

# 1. Run Migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# 2. Collect Static Files (Crucial for later when we add CSS/JS)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 3. Start the Server
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000