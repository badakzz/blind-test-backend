FROM node:alpine

# Set working directory
WORKDIR '/src/websocket-server'

# Install app dependencies
COPY websocket-server/package*.json ./
RUN yarn install --pure-lockfile

# Bundle app source
COPY websocket-server .

# Build and run the app
RUN yarn build
CMD ["yarn", "start"]
