# Build stage
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o craftai-server ./cmd/server/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/craftai-server .

# Copy static files and templates
COPY --from=builder /app/internal/static ./internal/static
COPY --from=builder /app/internal/templates ./internal/templates

# Create non-root user
RUN addgroup -g 1000 -S craftai && \
    adduser -u 1000 -S craftai -G craftai

# Change ownership
RUN chown -R craftai:craftai /app

USER craftai

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the binary
CMD ["./craftai-server"]