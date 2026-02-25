# Configuration Files

Shipped uses YAML configuration files in your config directory. All files are optional - defaults are used if a file is missing or empty.

## Quick Example

```yaml
# lists.yaml - What packages to track
- name: My Packages
  groups:
    - name: frontend
      packages:
        - provider: github
          name: vuejs/vue
        - provider: npm
          name: vue

# providers.yaml - Provider defaults
github:
  extra:
    maxReleases: 5
    includePrereleases: false

# general.yaml - App settings
streamConfigChanges: true

# ui.yaml - UI customization
maxListsInHeader: 3
```

---

## lists.yaml

Defines which packages to track, organized into lists and groups.

```yaml
- name: Frontend Tools
  description: Essential frontend libraries
  groups:
    - name: frameworks
      displayName: JavaScript Frameworks
      packages:
        - provider: github
          name: vuejs/vue
          displayName: Vue.js
        - provider: github
          name: facebook/react
          displayName: React
        - provider: npm
          name: sveltejs/svelte
          displayName: Svelte

    - name: tooling
      displayName: Build Tools
      packages:
        - provider: npm
          name: vite
        - provider: npm
          name: webpack

- name: Backend Services
  groups:
    - name: databases
      packages:
        - provider: docker
          name: postgres
          displayName: PostgreSQL
          extra:
            tags: ["latest", "alpine"]

    - name: python
      packages:
        - provider: python
          name: fastapi
        - provider: python
          name: django
          extra:
            maxReleases: 10
```

### For provider-specific configuration options, see [providers](providers.md).

### Package Provider Formats

| Provider | Format | Examples |
|----------|--------|----------|
| GitHub | `owner/repo` | `vuejs/vue`, `microsoft/typescript` |
| NPM | package name | `react`, `@types/react` |
| Docker | `image` or `namespace/image` | `node`, `library/nginx` |
| Python | package name | `requests`, `django` |

---

## providers.yaml

Configures provider-specific options. These act as defaults - can be overridden per-package in lists.yaml.

```yaml
github:
  extra:
    maxReleases: 5
    includePrereleases: false

npm:
  extra:
    tags:
      - latest
      - beta

docker:
  extra:
    tags:
      - latest
      - slim
      - alpine

python:
  extra:
    maxReleases: 5
```

### For provider-specific configuration options, see [providers](providers.md).

---

## general.yaml

General application settings.

```yaml
# Enable real-time config updates (changes appear without refresh)
streamConfigChanges: true
```

---

## ui.yaml

UI customization options.

```yaml
# Maximum lists to show in header navigation
maxListsInHeader: 3
```

---

## IDE Validation

For IDE autocompletion, add the schema reference to each file:

These are included by default.

```yaml
# lists.yaml
# yaml-language-server: $schema: https://raw.githubusercontent.com/nipakke/shipped/main/docs/config-files/lists.json

# providers.yaml
# yaml-language-server: $schema: https://raw.githubusercontent.com/nipakke/shipped/main/docs/config-files/providers.json

# general.yaml
# yaml-language-server: $schema: https://raw.githubusercontent.com/nipakke/shipped/main/docs/config-files/general.json

# ui.yaml
# yaml-language-server: $schema: https://raw.githubusercontent.com/nipakke/shipped/main/docs/config-files/ui.json
```