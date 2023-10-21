# FROM public.ecr.aws/amazonlinux/amazonlinux:2
# ENV NODE_VERSION=16.19.1
FROM node:18
ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2

EXPOSE 3000

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    tini && \
    gcsFuseRepo=gcsfuse-`lsb_release -c -s` && \
    echo "deb http://packages.cloud.google.com/apt $gcsFuseRepo main" | \
    tee /etc/apt/sources.list.d/gcsfuse.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    apt-key add - && \
    apt-get update && \
    # apt-get install -y gcsfuse && \
    apt-get clean

# workaround
ENV GCSFUSE_VERSION=1.2.0
RUN apt-get update -y && \
    curl -LJO "https://github.com/GoogleCloudPlatform/gcsfuse/releases/download/v${GCSFUSE_VERSION}/gcsfuse_${GCSFUSE_VERSION}_amd64.deb" && \
    apt-get -y install fuse && \
    apt-get clean && \
    dpkg -i "gcsfuse_${GCSFUSE_VERSION}_amd64.deb"


# RUN yum update -y \
#    && yum install -y curl \
#    && yum install -y tar

# RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash \
#     && yum install -y nodejs
# RUN node --version
# RUN npm --version
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

RUN npm install --production

# Use tini to manage zombie processes and signal forwarding
# https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

WORKDIR /src/microservices/notifications
# Ensure the script is executable
RUN chmod +x gcsfuse_run.sh

CMD ["/src/microservices/notifications/gcsfuse_run.sh"]
# [END cloudrun_fuse_dockerfile]