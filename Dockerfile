FROM ubuntu:16.04

MAINTAINER dra1n <dra1n86@gmail.com>

# Install nodejs
RUN \
  apt-get update && \
  apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN \
  apt-get update && \
  apt-get install -y nodejs

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

CMD ["npm", "start"]
