#!/bin/sh

# Set environment variables from .env file
export $(cat ./.env | xargs)
echo "POSTGRES_HOST: $POSTGRES_HOST"

# Print NODE_SERVER_PORT to debug
echo "NODE_SERVER_PORT: $NODE_SERVER_PORT"

# Start your application
echo "Starting the application..."
yarn start

# Ensure the script doesn't exit
tail -f /dev/null
