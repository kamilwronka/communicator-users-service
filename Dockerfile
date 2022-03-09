FROM node:latest

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

EXPOSE 4000

ENTRYPOINT [ "yarn", "start:prod" ]