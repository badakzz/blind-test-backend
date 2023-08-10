# Build http-server
FROM node:alpine as http-builder
WORKDIR /app/http-server
COPY ./http-server/package.json ./http-server/yarn.lock ./
COPY ./http-server ./
RUN yarn install --pure-lockfile
RUN yarn build

# Build websocket-server
FROM node:alpine as websocket-builder
WORKDIR /app/websocket-server
# Copying the built http-server files (including JavaScript and type declarations)
COPY --from=http-builder /app/http-server/dist-http /app/http-server
COPY ./websocket-server/package.json ./websocket-server/yarn.lock ./
COPY ./websocket-server ./
RUN yarn install --pure-lockfile
RUN yarn build

# Final image
FROM node:alpine
WORKDIR /app
# Copying the built files from the previous stages
COPY ./http-server/package.json /app/dist-http/package.json
COPY ./http-server/yarn.lock /app/dist-http/yarn.lock
COPY ./websocket-server/package.json /app/dist-websocket/package.json
COPY ./websocket-server/yarn.lock /app/dist-websocket/yarn.lock
COPY --from=http-builder /app/http-server/dist-http /app/dist-http
COPY --from=websocket-builder /app/websocket-server/dist-websocket /app/dist-websocket

WORKDIR /app/dist-websocket
RUN yarn install

WORKDIR /app/dist-http
RUN yarn install

WORKDIR /app

COPY ./.env /app/.env
RUN export $(cat ./.env | xargs)

RUN ln -s /app/dist-http /app/http-server

COPY ./docker_scripts/start.sh /app/start.sh
CMD ["/app/start.sh"]
