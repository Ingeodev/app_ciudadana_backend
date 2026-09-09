FROM node:18

RUN apt-get update && apt-get install -y tini && apt-get clean

ENV PATH=/usr/local/bin:$PATH \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    WEB_CONCURRENCY=2

EXPOSE 3000

WORKDIR /src

COPY src/microservices/fileManagement/ /src/microservices/fileManagement
COPY src/package.json /src
COPY src/package-lock.json /src
COPY src/middleware /src/middleware/
COPY src/models /src/models/
COPY src/config /src/config/
COPY src/constants /src/constants/
COPY src/utils /src/utils/

RUN npm install --production

WORKDIR /src/microservices/fileManagement

CMD ["node", "index.js"]