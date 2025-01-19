# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the application using the production configuration
RUN pnpm run build --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Remove the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy the built Angular app from Stage 1
COPY --from=build /app/dist/manna-front-v2 /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]