# Glossary

Key terms and concepts used in shipped.

## General Terms

**Provider**
A service that provides package data. shipped supports GitHub, NPM, Docker Hub, and Python (PyPI) providers. Each provider has unique configuration options and package name formats.

**Package**
A software library, tool, or application tracked for releases. Defined with a provider, name, and optional configuration. Packages are organized into lists and groups.

**Release**
A version update of a package. Releases include version numbers, release dates, and optionally release notes or URLs.

## Configuration Terms

**List**
A collection of packages organized into named groups. Lists appear as separate pages in the UI and can be accessed via URL slugs (e.g., `/list/my-packages`).

**Group**
A subsection within a list that organizes related packages. Groups have names and optionally display names. They're shown as sections on the list page.

**Extras**
Provider-specific configuration options nested under `extra` in YAML. Can be set globally per provider in `providers.yaml` or per package in `lists.yaml`. Package extras take priority over provider extras.

**Slug**
A URL-friendly version of a list name. Automatically generated from the list name (e.g., "My Packages" → "my-packages"). Used in URLs to access lists.

## Technical Terms

**Hash-Based Package ID**
A unique identifier for a package based on a hash of its configuration. Prevents arbitrary API requests and enables cache invalidation when settings change.

**Config Hot-Reloading**
The ability to update configuration without restarting the server. Changes to YAML files are detected and applied automatically via file watching.

**L1/L2 Cache**
Two-layer caching system:
- **L1 (Memory)**: Fast in-memory cache, lost on restart
- **L2 (File)**: Persistent file-based cache, survives restarts

**Request Coalescing**
When multiple requests for the same package occur simultaneously, only one external API call is made. All requests receive the same result.

**SSE (Server-Sent Events)**
A technology for pushing real-time updates from server to client. Used to broadcast config changes to connected browsers.

**Effect TS**
A functional programming library used for server-side business logic. Provides typed error handling and composable effects.

## File Terms

**lists.yaml**
Configuration file defining package lists, groups, and individual packages.

**providers.yaml**
Configuration file for provider-specific settings and global defaults.

**general.yaml**
Configuration file for general app settings like streaming behavior.

**ui.yaml**
Configuration file for UI customization options.

## Provider-Specific Terms

**GitHub Owner/Repo**
The format for GitHub packages: `owner/repo` (e.g., `vuejs/vue`). The owner is the user or organization, and the repo is the repository name.

**NPM Scope**
Scoped packages on NPM start with `@` (e.g., `@types/react`). The scope is the part before the slash.

**Docker Image/Tag**
Docker images are identified by name and optional tag (e.g., `node:latest`, `node:alpine`). Official images don't need a namespace.

**PyPI Package**
Python packages from the Python Package Index. Identified by package name (e.g., `requests`, `django`).

## UI Terms

**Header Navigation**
The top bar showing available lists. Limited by `maxListsInHeader` setting; additional lists appear in a dropdown.

**Package Card**
A UI component displaying a single package with its icon, name, current version, and release date.

**Release Badge**
A visual indicator showing how recent a release is (e.g., "Today", "This week", "2 weeks ago").
