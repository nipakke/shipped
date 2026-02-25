# Shipped

<p align="center">
  <img src="https://img.shields.io/github/v/release/nipakke/shipped?label=version" alt="Version">
  <img src="https://img.shields.io/docker/v/nipakke/shipped?label=docker" alt="Docker">
</p>

**Shipped** is a self-hosted dashboard that tracks package releases across platforms like GitHub, NPM, and Docker. Group dependencies into custom lists to instantly monitor new versions.

## Features

- **Multi-Provider Support**: Track releases from GitHub, NPM, Docker Hub, etc.
- **Organized Lists**: Group packages into custom lists with sections
- **Real-Time Updates**: Config changes propagate to the UI instantly via hot-reloading
- **Smart Caching**: Multi-layer caching (L1 memory + L2 file) minimizes API calls
- **Hash-Based Security**: Only pre-configured packages can be queried

## Docker compose

```yaml
services:
  shipped:
    image: nipakke/shipped:1
    ports:
      - 3000:3000
    volumes:
      - /path-to-data:/data
      # or separate mounts
      #- /path-to-data/config:/data/config
      #- /path-to-data/cache:/data/cache
    restart: unless-stopped
```

## Documentation

- **[Configuration](docs/configuration.md)** - Dynamic and static config overview
  - **[Config Files](docs/config-files.md)** - YAML configuration reference
  - **[Environment Variables](docs/env.md)** - Static configuration
- **[Providers](docs/providers.md)** - Supported package providers
- **[Architecture](docs/architecture/overview.md)** - Internal details

See [Architecture Overview](docs/architecture/overview.md) for detailed documentation.

## License

MIT

## Feedback

Found an issue or have a suggestion? [Open a GitHub issue](https://github.com/nipakke/shipped/issues).