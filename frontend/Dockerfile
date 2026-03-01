# Stage 1: Build the React Application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (using legacy peer deps to match local environment)
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the App using Nginx
FROM nginx:alpine

# Copy the build output to Nginx's HTML root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite default Nginx configuration to support React Router (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
