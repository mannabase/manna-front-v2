# -------------------------
# Stage 1: Build Angular
# -------------------------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy package files
    COPY package*.json ./
    RUN npm install
    
    # Copy everything and build
    COPY . .
    RUN npm run build # or npm run build -- --prod 
    
    # -------------------------
    # Stage 2: Serve with NGINX
    # -------------------------
    FROM nginx:alpine
    
    # Notice we reference the 'browser' subfolder
    COPY --from=builder /app/dist/manna-front-v2/browser/ /usr/share/nginx/html/
    
    EXPOSE 80
    