FROM node:18-alpine3.18

RUN apk update && apk add --no-cache tini

ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2
ENV MNT_DIR /src/uploads

EXPOSE 3000

WORKDIR /src
COPY src/microservices/admin/ /src/microservices/admin
COPY src/package.json /src
COPY src/package-lock.json /src
COPY src/middleware /src/middleware/
COPY src/models /src/models/
COPY src/config /src/config/
COPY src/constants /src/constants/
COPY src/utils /src/utils/
COPY workspace/config/account_service_key.json /src/config
COPY workspace/config/email_service_key.json /src/config

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/sbin/tini", "--"]

RUN npm install --production

WORKDIR /src/microservices/admin

CMD ["node", "./index.js"]