#!/bin/sh

# start nginx in the background
echo "Starting Nginx..."
nginx &

# run database migrations (if any)
echo "Running flask db migrations..."
flask db migrate
flask db upgrade

echo "Starting flask server..."
flask run --host=0.0.0.0
