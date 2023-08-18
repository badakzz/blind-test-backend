FROM node:alpine as build
WORKDIR /app

COPY . .

RUN yarn install --pure-lockfile
RUN yarn build