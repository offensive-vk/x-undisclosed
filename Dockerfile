FROM node:24-alpine
RUN npm install -g pnpm@10.25.0
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i
COPY . .
RUN pnpm run build
EXPOSE 7777
CMD ["pnpm", "run", "dev"]