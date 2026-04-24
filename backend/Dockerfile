FROM node:22.22-alpine3.22

WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN addgroup -S nestapp && adduser -S nestapp -G nestapp
USER nestapp

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]