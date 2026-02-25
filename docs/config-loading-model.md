# Config Loading and View System Model

This document describes how the config loading, parsing, and view system works in the application.

## Overview

The config system uses a custom loader with chokidar for file watching, Effect schemas for validation, and view classes for structured data access. Configs are transmitted to the client via Nuxt's SSR payload and can be refreshed via SSE or HTTP requests.

## Config Loading with Custom Loader

Config files are loaded from the `config/` directory using a custom loader in `server/infra/config-loader/`.

### File Watching

- Uses chokidar to monitor YAML files (general.yaml, ui.yaml, lists.yaml)
- Debounced stream processing for file change events
- Automatic config reloading on file modifications

### Individual File Loaders

- general.ts: Loads general settings with defaults
- ui.ts: Loads UI configuration
- lists.ts: Loads package lists
- Uses YAML parsing with Effect Schema validation
- Auto-creates default config files if missing

## Effect Schema Validation

All configuration uses Effect Schemas defined in `libs/config-new/schema.ts`:

- UserConfig: Top-level config structure
- UIConfig: UI-related settings
- GeneralConfig: General application settings
- ListConfig: Package list configurations
- PackageConfig: Individual package settings

Provides runtime type safety and validation.

## View Classes

View classes in `libs/config-new/view.ts` transform raw config into structured objects:

- PackageConfigView: Individual package with computed properties
- ListConfigView: Package list with slug and packages array
- UserConfigView: Main config view containing ui, general, and lists views

Uses Effect's Data.Class for immutable data structures.

## SSR Transmission

```
Server-Side (SSR):
  UserConfigLoader (chokidar) → RPC.get() → injectUserConfig() → Nuxt Payload State

Client-Side:
  Nuxt Payload → extractUserConfig() → UserConfigView.make() → Reactive Store
```

- Server injects config into Nuxt's payload during SSR
- Client extracts and creates view objects from payload
- Available via useUserConfig() composable

## Config Refresh Mechanisms

### SSE Streaming (Default)

```
Server: RPC.getStream() → Stream.toAsyncIterable(changes) → Event Iterator
Client: EventSource → consumeEventIterator() → Auto-update views
```

- Real-time updates when streamConfigChanges is enabled (default: true)
- Automatic reconnection on connection failures
- Uses ORPC for type-safe streaming

### HTTP Fallback

```
Client: refresh() → RPC.get() → Manual update views
```

- Manual refresh method available
- Uses standard RPC call for on-demand updates
- Same raw config → view creation process

## Client-Side Architecture

- Plugin in layers/01-base/app/plugins/02-config.ts handles initialization
- Reactive refs for config data, connection status, and streaming status
- Graceful degradation when streaming fails
- Composable provides unified access to views and refresh methods