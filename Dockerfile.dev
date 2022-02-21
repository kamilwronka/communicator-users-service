FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN yarn

EXPOSE 4000

ENTRYPOINT [ "yarn", "start:dev" ]