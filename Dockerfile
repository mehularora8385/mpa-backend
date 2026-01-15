FROM node:16-slim

WORKDIR /app

COPY package*.json ./

COPY node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
