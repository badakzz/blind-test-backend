#!/bin/sh

# Set environment variables from .env file
export $(cat ./.env | xargs)
echo "POSTGRES_HOST: $POSTGRES_HOST"

# Start your applications
yarn start
