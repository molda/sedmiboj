FROM --platform=linux/amd64 node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

COPY . .

#CMD [ "npm", "start" ]
#CMD node index.js > logs/debug.log
CMD node index.js