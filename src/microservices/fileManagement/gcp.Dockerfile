FROM node:18-alpine3.18
RUN apk update && apk add --no-cache gnupg ca-certificates
RUN apk add --no-cache --virtual .build-deps bash gcc musl-dev openssl go && update-ca-certificates

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
RUN go install github.com/googlecloudplatform/gcsfuse@master

RUN apk add --update --no-cache fuse tini

ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2

EXPOSE 3000

ENV MNT_DIR /src/uploads

WORKDIR /src
COPY src/microservices/fileManagement/ /src/microservices/fileManagement
COPY src/package.json /src
COPY src/package-lock.json /src
COPY src/middleware /src/middleware/
COPY src/models /src/models/
COPY src/config /src/config/
COPY src/constants /src/constants/
COPY src/utils /src/utils/
COPY workspace/config/account_service_key.json /src/config
COPY workspace/config/config.json /src/config

RUN npm install --production

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /src/microservices/fileManagement
# Ensure the script is executable
RUN chmod +x gcsfuse_run.sh

CMD ["/src/microservices/fileManagement/gcsfuse_run.sh"]
# [END cloudrun_fuse_dockerfile]