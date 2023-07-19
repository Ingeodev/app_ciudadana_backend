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
COPY . /srv

RUN npm install --production

CMD ["node", "./index.js"]
