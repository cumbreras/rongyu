
FROM node:14.3 as base

RUN apt-get update && apt-get install curl build-essential software-properties-common -y

WORKDIR /usr/src/app
COPY . ./

RUN npm install --no-optional
RUN npm run compile && npm run test
CMD ["npm", "run", "start:dev"]
