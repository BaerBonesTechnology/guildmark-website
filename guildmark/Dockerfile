# Multi-stage build — produces a minimal nginx image serving the Vite bundle.

FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

COPY . .

# Build args become Vite env vars at build time.
ARG VITE_API_URL=""
ARG VITE_IS_LAUNCH=false
ARG VITE_IS_DEBUG=false

RUN VITE_API_URL=$VITE_API_URL \
    VITE_IS_LAUNCH=$VITE_IS_LAUNCH \
    VITE_IS_DEBUG=$VITE_IS_DEBUG \
    pnpm build

# Runtime — nginx serving the static bundle.
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback — serve index.html for all routes.
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
