FROM --platform=linux/arm64/v8 node:20.9-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

COPY . .

#CMD [ "npm", "start" ]
#CMD node index.js > logs/debug.log
CMD npm run dev

#CMD node index.js