FROM node:24-alpine
RUN apk add --no-cache python3 py3-pip make g++ \
  && ln -sf python3 /usr/bin/python \
  && ln -sf pip3 /usr/bin/pip
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "."]
