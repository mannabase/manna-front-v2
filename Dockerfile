# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Use a local cache for pnpm
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --store-dir=/root/.pnpm-store

# Copy the rest of the application files
COPY . .

# Build the application
RUN pnpm run build --configuration production

# Debug: List the contents of the build output directory
RUN ls -la /app/dist/manna-front-v2

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the build output to the Nginx HTML directory
COPY --from=build /app/dist/manna-front-v2/browser /usr/share/nginx/html

# Debug: List the contents of the Nginx HTML directory
RUN ls -la /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]