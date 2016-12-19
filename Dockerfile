FROM risingstack/alpine:3.4-v7.0.0-4.1.0

MAINTAINER Jaydeep Solanki <jaydp17@gmail.com>

RUN mkdir /src

WORKDIR /src

RUN npm i -g yarn

COPY package.json yarn.lock /src/

ADD .yarn-cache.tgz /

RUN NODE_ENV=development yarn

COPY . /src

RUN yarn build

CMD yarn start
