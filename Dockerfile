# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# copy package manifest(s) and install all deps (including dev) for build
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
