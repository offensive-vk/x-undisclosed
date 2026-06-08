FROM node:24-slim
RUN npm install -g pnpm@11.5.0
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i
COPY . .
RUN pnpm run build
EXPOSE 7777
CMD ["pnpm", "run", "dev"]