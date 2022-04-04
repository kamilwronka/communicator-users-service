FROM node:16-alpine AS BUILD_IMAGE

ARG GKE_SA_KEY
ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/credentials.json

# install dependencies
RUN apk update && apk add curl bash

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./

# authenticate with artifact registry
RUN npm install -g google-artifactregistry-auth
RUN echo ${GKE_SA_KEY} | base64 -d > credentials.json
RUN npm run artifactregistry-login

# install force resolutions package
RUN npm install -g npm-force-resolutions

RUN npm ci

COPY . .

RUN npm run build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

FROM node:16-alpine
WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/src/app/package.json ./

EXPOSE 4000

ENTRYPOINT [ "npm", "run", "start:prod" ]