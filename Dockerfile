FROM node:16-alpine

# Setup global npm directory
USER node

RUN mkdir /home/node/.npm-global ; \
    mkdir -p /home/node/app ; \
    chown -R node:node /home/node/app ; \
    chown -R node:node /home/node/.npm-global

ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# Prepare service
WORKDIR /home/node/app

ENV DOCKER=TRUE

USER $USER

# Install app dependencies
COPY . /home/node/app

ENV NPM_CONFIG_LOGLEVEL error
RUN npm install --quiet

# Build files
RUN npm run build

ARG NODE=production
ENV NODE_ENV ${NODE}
ARG PORT

# Make port from arguments available to the world outside this container
EXPOSE $PORT

CMD [ "npm", "run", "start" ]