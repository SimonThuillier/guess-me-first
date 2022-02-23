FROM node:17.4

# we begin by installing dependencies
# first the server-side dependencies
WORKDIR /home/gmf
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm ci --only=production
# second client-side dependencies
WORKDIR /home/gmf/client
COPY client/package*.json ./
RUN npm install

WORKDIR /home/gmf
# Bundle app source
COPY . .

# build client production assets
WORKDIR /home/gmf/client
RUN npm run build

# copy public assets
WORKDIR /home/gmf
RUN mkdir ./public
RUN cp -r ./client/dist/* ./public
RUN cp ./public.dist/d3.min.js ./public

EXPOSE 3001
CMD [ "node", "./src/index.js" ]

