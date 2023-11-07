# https://hub.docker.com/_/node/
FROM node:18-alpine3.18
RUN apk update && apk add --no-cache gnupg ca-certificates
RUN apk add --no-cache --virtual .build-deps bash gcc musl-dev openssl go && update-ca-certificates

# https://stackoverflow.com/questions/52056387/how-to-install-go-in-alpine-linux
# https://go.dev/doc/install
# https://go.dev/dl/
# download go tar
WORKDIR /usr/local
RUN wget -O go.tar.gz https://go.dev/dl/go1.21.3.src.tar.gz 
RUN tar -C /usr/local -xzf go.tar.gz 
# compile code
RUN cd /usr/local/go/src && chmod +x make.bash && ./make.bash
ENV PATH=$PATH:/usr/local/go/bin
RUN rm -rf /usr/local/go.tar.gz
RUN apk del .build-deps go
RUN go version
ENV GOPATH /usr/local/go
RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 1777 "$GOPATH"
WORKDIR $GOPATH

# Compile gcsfuse - option 1
# https://cloud.google.com/storage/docs/gcsfuse-install
RUN go install github.com/googlecloudplatform/gcsfuse@master
# If successful, a binary named gcsfuse is installed to $GOPATH/bin. 
# GOPATH is an environment variable that's used to find the root of your go workspace.

# Compile gcsfuse - option 2
# ENV GCSFUSE_VERSION=1.2.0
# RUN wget -O gcsfuse-${GCSFUSE_VERSION}.tar.gz https://github.com/GoogleCloudPlatform/gcsfuse/archive/refs/tags/v${GCSFUSE_VERSION}.tar.gz
# RUN tar -C /run -xzf gcsfuse-${GCSFUSE_VERSION}.tar.gz 
# ENV GCSFUSE_REPO="/run/gcsfuse-${GCSFUSE_VERSION}/"
# WORKDIR ${GCSFUSE_REPO}
# RUN go install .
# If successful, a binary named gcsfuse is installed to $GOPATH/bin.

# Compile gcsfuse - option 3
# https://github.com/GoogleCloudPlatform/gcsfuse/issues/543
# https://github.com/GoogleCloudPlatform/gcsfuse/blob/master/Dockerfile
# WORKDIR /run
# ENV GCSFUSE_VERSION=1.2.0
# RUN wget -O gcsfuse-${GCSFUSE_VERSION}.tar.gz https://github.com/GoogleCloudPlatform/gcsfuse/archive/refs/tags/v${GCSFUSE_VERSION}.tar.gz
# RUN tar -C /run -xzf gcsfuse-${GCSFUSE_VERSION}.tar.gz 
# ENV GCSFUSE_REPO="/run/gcsfuse-${GCSFUSE_VERSION}/"
# WORKDIR ${GCSFUSE_REPO}
# RUN go install ./tools/build_gcsfuse
# build_gcsfuse src_dir dst_dir version
# RUN build_gcsfuse . /tmp 1

RUN apk add --update --no-cache fuse tini

ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2

EXPOSE 3000

ENV MNT_DIR /src/uploads

WORKDIR /src
COPY src/microservices/notifications/ /src/microservices/notifications
COPY src/package.json /src
COPY src/package-lock.json /src
COPY src/middleware /src/middleware/
COPY src/models /src/models/
COPY src/config /src/config/
COPY src/constants /src/constants/
COPY src/utils /src/utils/
COPY workspace/config/account_service_key.json /src/config
COPY workspace/secrets/notification_secrets.json /src/microservices/notifications/secrets.json
COPY workspace/config/config.json /src/config
# COPY src/config/account_service_key.json /src/config
# COPY src/config/config.json /src/config

RUN npm install --production

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
# ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /src/microservices/notifications
# CMD ["node", "./index.js"]
RUN chmod +x gcsfuse_run.sh
CMD ["/src/microservices/notifications/gcsfuse_run.sh"]