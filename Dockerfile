FROM node:26-slim
RUN npm install -g pnpm@11.5.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 7777
CMD ["pnpm", "run", "preview"]