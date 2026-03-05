# Production-optimized multi-stage Dockerfile for Rukhalt Server
# Blazing fast builds with minimal image size

# --------------------------------------------------
# Builder Stage - Build the binary
# --------------------------------------------------
FROM golang:1.26-alpine AS builder

WORKDIR /build

# Install only essential build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files and download dependencies (cached layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build optimized binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -extldflags '-static'" \
    -trimpath \
    -o rukhalt \
    ./cmd

# --------------------------------------------------
# Production Stage - Minimal runtime
# --------------------------------------------------
FROM alpine:3.19

# Install only runtime essentials
RUN apk add --no-cache ca-certificates tzdata && \
    addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=appuser:appuser /build/rukhalt .
COPY --chown=appuser:appuser migrations ./migrations

# Create directories
RUN mkdir -p /app/backups /app/logs && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./rukhalt", "serve"]
