FROM node:10.15.3 as builder

RUN mkdir -p /usr/src/app/backend
WORKDIR /usr/src/app/backend

#ENV NODE_ENV=production

COPY backend/package.json /usr/src/app/backend
COPY backend/yarn.lock /usr/src/app/backend
RUN yarn install --non-interactive #--production


FROM node:10.15.3-alpine as release

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/backend/node_modules /usr/src/app/backend/node_modules

COPY . /usr/src/app

WORKDIR /usr/src/app/backend
