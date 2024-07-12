# Back-end for the blind test app

Uses the ORM Sequelize.
It runs on an Express server on port 3002, and the websocket runs on port 3001.
The database runs on PostgreSQL.

https://blindtest.lucasderay.com

## Setup

### Database

Create a PostgreSQL database and user :
```shell
sudo -u postgres createuser -s -P -e blindtestadm
sudo -u postgres createdb --encoding=UTF8 --owner=blindtestadm blindtestdb
```

You will then need to create a `.env` file at the root level and specify
```
POSTGRES_HOST=localhost
POSTGRES_DATABASE=blindtestdb
POSTGRES_USER=blindtestadm
POSTGRES_PASSWORD=
POSTGRES_PORT=5432
```

For the app to be fully functional, you'll also need to specify :
```
NODE_SERVER_DOMAIN=localhost
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET_KEY=
JWT_COOKIE_NAME=
COOKIE_PARSER_SECRET=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
```

## Running the app

```shell
yarn install
yarn dev
```
