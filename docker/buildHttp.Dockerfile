FROM node:alpine

# Set working directory
WORKDIR '/src/http-server'

# Install app dependencies
COPY http-server/package*.json ./
RUN yarn install --pure-lockfile

# Bundle app source
COPY http-server .

# Build and run the app
RUN yarn build
CMD ["yarn", "start"]
