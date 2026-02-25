# Configuration Guide

| Type | Files | Description |
|------|-------|-------------|
| **Dynamic** | YAML files in config directory | Package lists, provider settings, UI preferences. Changes apply without restart. |
| **Static** | Environment variables | Server settings, cache options. Require container restart to change. |

## Dynamic Configuration (YAML Files)

Place these files in your config directory (default: `/data/config` inside the container).

| File | Purpose |
|------|---------|
| `lists.yaml` | Define which packages to track |
| `providers.yaml` | Configure provider defaults and extra options |
| `general.yaml` | General application settings |
| `ui.yaml` | UI customization |

All config files are optional. If a file is missing, it is automatically created with default values. If a file is invalid, defaults are used and a warning appears in the UI.

### Quick Reference

```yaml
# lists.yaml
- name: My List
  groups:
    - name: Group Name
      packages:
        - provider: npm
          name: vue

# providers.yaml - Provider defaults
github:
  extra:
    maxReleases: 5

# general.yaml - App settings
streamConfigChanges: true

# ui.yaml - UI customization
maxListsInHeader: 3
```

See [Config Files Reference](config-files.md) for detailed documentation.

## Static Configuration (Environment Variables)

Environment variables control server behavior and caching. Set them in your Docker run command or compose file.

See [Environment Variables](env.md) for the complete list.

## JSON Schemas

For IDE autocompletion and validation, shipped generates JSON schemas for all config files:

- [general.json](./config-files/general.json)
- [lists.json](./config-files/lists.json)
- [providers.json](./config-files/providers.json)
- [ui.json](./config-files/ui.json)

Add the `$schema` property to your YAML files:

```yaml lists.yaml
# yaml-language-server: $schema: https://raw.githubusercontent.com/nipakke/shipped/main/docs/config-files/lists.json
- name: My List
  # ... your config
```

## Next Steps

1. [Config Files](config-files.md) - Complete reference with examples
2. [Environment Variables](env.md) - Fine-tune server behavior

If you experience issues with file watching (common in Docker on macOS or network filesystems), you can enable polling mode via environment variable: `SERVER_CONFIG_WATCH_POLLING=true`


## Environment Variables

Some settings can be controlled via environment variables:

- **Config directory**: `SERVER_CONFIG_DIR` (default: `config` relative to working directory, or `/data/config` in Docker)
- **File watching**: `SERVER_CONFIG_WATCH_POLLING` (default: `false`)
- **Cache settings**: See [Environment Variables](env.md)

## Validation

The app validates all configuration on startup and reload. Invalid configurations are handled gracefully:

- Invalid lists/packages are skipped with warnings
- Invalid config files fall back to defaults
- Errors are logged but the app continues running