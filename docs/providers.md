# Providers

Shipped supports multiple package providers. Each provider fetches release information from different sources.

For full configuration schema (including provider-specific `extra` options), see:
- [providers.json](./config-files/providers.json) - global provider defaults
- [lists.json](./config-files/lists.json) - per-package configuration

## Supported Providers

| Provider | Package Format | Source |
|----------|---------------|--------|
| GitHub | `owner/repo` (e.g., `vuejs/vue`) | [source](../shared/providers/github.ts) |
| NPM | package name (e.g., `react`, `@types/react`) | [source](../shared/providers/npm.ts) |
| Docker Hub | `image` or `namespace/image` (e.g., `node`, `library/nginx`) | [source](../shared/providers/docker.ts) |
| Python | package name (e.g., `requests`, `django`) | [source](../shared/providers/python.ts) |