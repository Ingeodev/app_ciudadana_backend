FROM golang:1.21.3-alpine as builder

RUN apk add git

ARG GCSFUSE_REPO="/run/gcsfuse/"
ADD . ${GCSFUSE_REPO}
WORKDIR ${GCSFUSE_REPO}
RUN go install ./tools/build_gcsfuse
RUN build_gcsfuse . /tmp $(git log -1 --format=format:"%H")

FROM alpine:3.13

RUN apk add --update --no-cache bash ca-certificates fuse

COPY --from=builder /tmp/bin/gcsfuse /usr/local/bin/gcsfuse
COPY --from=builder /tmp/sbin/mount.gcsfuse /usr/sbin/mount.gcsfuse
ENTRYPOINT ["gcsfuse", "-o", "allow_other", "--foreground", "--implicit-dirs", "/gcs"]

FROM node:18.8.0-alpine
ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2

EXPOSE 3000

RUN apk update && apk add --no-cache gnupg

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
# COPY workspace/config/account_service_key.json /src/config
# COPY workspace/config/config.json /src/config
COPY src/config/account_service_key.json /src/config
COPY src/config/config.json /src/config

RUN npm install --production

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
# ENTRYPOINT ["/usr/bin/tini", "--"]
# ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /src/microservices/notifications
# Ensure the script is executable
# RUN chmod +x gcsfuse_run.sh

# CMD ["src/microservices/notifications/gcsfuse_run.sh"]
# [END cloudrun_fuse_dockerfile]
CMD ["node", "./index.js"]

