FROM node:alpine
WORKDIR /app

COPY . .

RUN yarn install --pure-lockfile
RUN yarn build

COPY ./.env /app/.env
RUN export $(cat ./.env | xargs)

FROM httpd:2.4
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/build/ /usr/local/apache2/htdocs/