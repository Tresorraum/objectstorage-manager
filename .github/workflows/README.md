# Rukhalt GitHub Actions Workflows

This directory contains CI/CD workflows for building and deploying Rukhalt components.

## Workflows

### 🔧 build-server.yml
Builds and pushes the backend server Docker image to GitHub Container Registry.

**Triggers:**
- Push to `main` branch with changes in `server/` directory
- Tags matching `server-v*.*.*` pattern
- Manual workflow dispatch

**Output:**
- Image: `ghcr.io/OWNER/REPO-server:latest`
- Platforms: linux/amd64, linux/arm64
- Size: ~46MB (12MB compressed)

### 🎨 build-client.yml
Builds and pushes the frontend client Docker image to GitHub Container Registry.

**Triggers:**
- Push to `main` branch with changes in `client/` directory
- Tags matching `client-v*.*.*` pattern
- Manual workflow dispatch

**Output:**
- Image: `ghcr.io/OWNER/REPO-client:latest`
- Platforms: linux/amd64, linux/arm64
- Size: ~75MB (20MB compressed)

## Features

✅ **Smart Change Detection**: Only builds images when relevant files change
✅ **Multi-platform**: Builds for both AMD64 and ARM64 architectures
✅ **Layer Caching**: Uses GitHub Actions cache for faster builds
✅ **Automatic Tagging**: Creates semantic version tags and SHA-based tags
✅ **Infrastructure Integration**: Triggers deployment in nesohq-infra repository

## Configuration

### Required Secrets

Set these in your GitHub repository settings:

#### For Client Build
- `VITE_API_URL` (optional): API endpoint URL
  - Default: `https://api.rukhalt.nesohq.org/api/v1`
  - Example: `https://api.rukhalt.nesohq.org/api/v1`

#### For Infrastructure Deployment
- `INFRA_REPO_TOKEN`: GitHub Personal Access Token with `repo` scope
  - Used to trigger deployments in `opskraken/nesohq-infra`
  - Create at: https://github.com/settings/tokens

### Image Tags

Images are tagged with multiple formats:

1. **Branch name**: `main`, `develop`
2. **Semantic version**: `v1.0.0`, `v1.0`, `v1`
3. **Git SHA**: `main-abc1234`
4. **Latest**: `latest` (only for main branch)

## Usage

### Manual Trigger

You can manually trigger builds from the Actions tab:

1. Go to Actions → Select workflow
2. Click "Run workflow"
3. Select branch
4. Click "Run workflow"

### Version Release

Create a new release:

```bash
# Server release
git tag server-v1.0.0
git push origin server-v1.0.0

# Client release
git tag client-v1.0.0
git push origin client-v1.0.0
```

### Pull Images

```bash
# Server
docker pull ghcr.io/OWNER/REPO-server:latest

# Client
docker pull ghcr.io/OWNER/REPO-client:latest
```

## Build Optimization

Both workflows use:
- Docker Buildx for multi-platform builds
- GitHub Actions cache for layer caching
- Multi-stage builds for minimal image size
- Parallel builds for faster CI/CD

## Deployment Flow

```
┌─────────────┐
│ Push to main│
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
  Changes in        Changes in        No changes
   server/           client/
       │                 │
       ▼                 ▼
  Build Server     Build Client
       │                 │
       ▼                 ▼
  Push to GHCR     Push to GHCR
       │                 │
       ▼                 ▼
  Trigger Infra    Trigger Infra
   Deployment       Deployment
```

## Troubleshooting

### Build Fails

1. Check workflow logs in Actions tab
2. Verify Dockerfile syntax
3. Test build locally:
   ```bash
   docker build -f server/Dockerfile server/
   docker build -f client/Dockerfile client/
   ```

### Image Not Found

1. Check if workflow completed successfully
2. Verify package visibility (should be public)
3. Check image name format

### Deployment Not Triggered

1. Verify `INFRA_REPO_TOKEN` secret is set
2. Check token has `repo` scope
3. Verify infrastructure repository exists

## Monitoring

View build status:
- Badge: `![Build Status](https://github.com/OWNER/REPO/workflows/Build%20and%20Push%20Server%20Image/badge.svg)`
- Actions tab: https://github.com/OWNER/REPO/actions

## Best Practices

1. **Test locally first**: Always test Docker builds locally before pushing
2. **Use semantic versioning**: Tag releases with proper version numbers
3. **Monitor build times**: Optimize if builds take too long
4. **Check image sizes**: Keep images as small as possible
5. **Review logs**: Check workflow logs for warnings or issues

## Support

For issues or questions:
- Check workflow logs
- Review Dockerfile changes
- Open an issue in the repository
