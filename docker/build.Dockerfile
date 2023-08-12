FROM node:alpine
WORKDIR /app

COPY . .

RUN yarn install --pure-lockfile
RUN yarn build

COPY ./.env /app/.env
RUN export $(cat ./.env | xargs)

# RUN ln -s /app/dist-http /app/http-server

COPY ./docker_scripts/start.sh /app/start.sh

CMD ["/app/start.sh"]
