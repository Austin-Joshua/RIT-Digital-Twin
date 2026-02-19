# ==============================================================
# RIT Digital Twin – Frontend Dockerfile
# Multi-stage: Node build → Nginx runtime
# ==============================================================

# ---- Stage 1: Build ----
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies (cache first)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Stage 2: Runtime ----
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
