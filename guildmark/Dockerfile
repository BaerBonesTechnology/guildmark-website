# Multi-stage build — produces a minimal nginx image serving the Vite bundle.
FROM node:22-alpine AS build

WORKDIR /app

# Install pnpm (Using corepack)
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

# Copy package files. The '*' makes the lockfile optional if it doesn't exist yet.
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build args become Vite env vars at build time.
ARG VITE_API_URL="https://api.guildmark.co"
ARG VITE_IS_LAUNCH=false
ARG VITE_IS_DEBUG=false

# Pass ARGs to the build environment and build the project
RUN VITE_API_URL=$VITE_API_URL \
    VITE_IS_LAUNCH=$VITE_IS_LAUNCH \
    VITE_IS_DEBUG=$VITE_IS_DEBUG \
    pnpm build

# Runtime — nginx serving the static bundle.
FROM nginx:1.27-alpine AS runtime

# Copy the build output from the build stage to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback — serve index.html for all routes.
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]