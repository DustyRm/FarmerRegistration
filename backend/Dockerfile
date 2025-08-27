FROM node:20-alpine AS dev
WORKDIR /app

ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm ci || npm install

EXPOSE 8080
CMD ["npm","run","start:dev"]
