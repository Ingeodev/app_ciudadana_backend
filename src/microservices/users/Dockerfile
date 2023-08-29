FROM public.ecr.aws/amazonlinux/amazonlinux:2
ENV NODE_VERSION=16.19.1
ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2

EXPOSE 3000

RUN yum update -y \
    && yum install -y curl \
    && yum install -y tar

RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash \
    && yum install -y nodejs
RUN node --version
RUN npm --version

WORKDIR /srv
COPY src/microservices/users/ /srv/microservices/users
COPY src/package.json /srv
COPY src/package-lock.json /srv
COPY src/models /srv/models/
COPY src/middleware /srv/middleware/
COPY src/config /srv/config/
COPY src/account_service_key.json /srv
COPY src/utils /srv/utils/

RUN npm install --production

WORKDIR /srv/microservices/users

CMD ["node", "./index.js"]
