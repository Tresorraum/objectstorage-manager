# Production-optimized multi-stage Dockerfile for Rukhalt Client
# Blazing fast builds with minimal image size

# --------------------------------------------------
# Builder Stage - Build the React app
# --------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files (cached layer)
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build optimized production bundle
RUN npm run build

# --------------------------------------------------
# Production Stage - Nginx serving static files
# --------------------------------------------------
FROM nginx:1.25-alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
