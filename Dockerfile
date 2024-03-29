FROM node:lts-alpine AS deps

WORKDIR /home/node/app
COPY package*.json ./
RUN npm install

FROM node:lts-alpine AS builder

ENV NODE_ENV=production

WORKDIR /home/node/app

COPY . ./
COPY --from=deps /home/node/app/node_modules ./node_modules

RUN npm run build

FROM node:lts-alpine AS runner

WORKDIR /home/node/app

EXPOSE 7080

COPY .env ./
COPY --from=builder /home/node/app/dist ./dist
COPY --from=deps /home/node/app/node_modules ./node_modules
COPY --from=deps /home/node/app/package.json ./

CMD [ "node", "./dist/index.js" ]
