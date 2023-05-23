FROM node:18

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
COPY knexfile.js /usr/src/app
COPY tsconfig.json /usr/src/app
COPY src /usr/src/app/src
COPY migrations /usr/src/app/migrations

RUN npm install --omit=dev
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
