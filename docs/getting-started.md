# Getting Started

Shipped is a self-hosted dashboard for tracking package releases from GitHub, NPM, Docker Hub, and PyPI.

## Quick Start

1. **Create a compose.yaml:**
   ```yaml
   services:
     shipped:
       image: nipakke/shipped:1
       ports:
         - "3000:3000"
       volumes:
         - ./data:/data
       restart: unless-stopped
   ```

2. **Start the container:**
   ```bash
   docker compose up -d
   ```

3. **Configure packages** in `data/config/lists.yaml`:
   ```yaml
   - name: My Packages
     groups:
       - name: frontend
         packages:
           - provider: npm
             name: vue
           - provider: github
             name: vuejs/vue
   ```

4. **Open** `http://localhost:3000`

Config files are created automatically with defaults if they don't exist.

## Next Steps

- [Configuration](configuration.md) - YAML config overview
- [Config Files](config-files.md) - Detailed reference
