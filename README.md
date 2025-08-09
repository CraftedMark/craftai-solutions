# CraftAI.Solutions Website

## Local Development

```bash
# Run with hot reload
air

# Or run directly
go run cmd/server/main.go
```

## Production Deployment

### Using Docker

```bash
# Build and run
docker build -t craftai-solutions .
docker run -p 3000:3000 -e PORT=3000 craftai-solutions

# Or use docker-compose
docker-compose up -d
```

### Environment Variables

- `PORT` - Server port (default: 3000)

### Health Check

The server exposes a health check endpoint at `/health`

### Troubleshooting 502 Errors

1. Check if the container is running:
   ```bash
   docker ps
   docker logs <container-id>
   ```

2. Verify the app is listening on the correct port:
   ```bash
   docker exec <container-id> netstat -tlpn
   ```

3. Check Coolify logs for deployment issues

4. Ensure the PORT environment variable is set correctly in Coolify

5. Check reverse proxy configuration (should proxy to container port 3000)

### File Structure

```
.
├── cmd/server/main.go      # Main server entry point
├── internal/
│   ├── handlers/          # HTTP handlers
│   ├── static/           # CSS, JS, images
│   └── templates/        # HTML templates
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose configuration
```