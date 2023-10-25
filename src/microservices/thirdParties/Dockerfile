FROM node:16
ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2
ENV MNT_DIR /src/uploads
EXPOSE 3000

RUN yum update -y \
    && yum install -y curl \
    && yum install -y tar

RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash \
    && yum install -y nodejs
RUN node --version
RUN npm --version

WORKDIR /src
COPY src/microservices/thirdParties/ /src/microservices/thirdParties
COPY src/package.json /src
COPY src/package-lock.json /src
COPY src/models /src/models/
COPY src/middleware /src/middleware/
COPY src/config /src/config/
COPY src/utils /src/utils/
COPY workspace/config/account_service_key.json /src/config
COPY workspace/config/email_service_key.json /src/config
COPY workspace/config/config.json /src/config

RUN npm install --production
WORKDIR /src/microservices/thirdParties

CMD ["node", "./index.js"]
