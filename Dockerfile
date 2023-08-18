FROM node:alpine
WORKDIR /app

COPY . .

RUN yarn install --pure-lockfile
RUN yarn build
