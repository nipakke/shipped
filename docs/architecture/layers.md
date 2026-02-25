# Layer Structure

The application uses Nuxt's layer system to organize code into logical groups. This document explains the layer architecture and why it's structured this way.

## Overview

```
layers/
├── 01-base/          # Core functionality, shared across all layers
└── 02-packages/      # Package-specific UI components
```

## Why Layers?

### Server: Single Layer

The server does NOT use layers - it's a unified codebase. Why?

- **Simpler dependency injection** - Effect layers compose naturally
- **No code splitting needed** - Server is always deployed as a unit
- **Easier testing** - One context to set up

### Client: Multiple Layers

The client IS split into layers for organizational benefits:

- **Separation of concerns** - Base vs. domain-specific features
- **Code organization** - Related components grouped together
- **Optional inclusion** - Future layers could be conditionally loaded
- **Clear dependencies** - Higher layers depend on lower layers

## Layer 01: Base

**Path**: `layers/01-base/`

**Purpose**: Core infrastructure and shared functionality

**What it contains**:

- **Config system** - Composables and plugins for reactive config
- **RPC client** - ORPC client setup and typed RPC calls
- **UI foundation** - Nuxt UI configuration, global styles
- **Type definitions** - Shared TypeScript types

### Key Files

```
01-base/
├── nuxt.config.ts           # Base Nuxt configuration
├── app/
│   ├── plugins/
│   │   └── 02-config.ts     # Config initialization plugin
│   ├── composables/
│   │   └── config.ts        # useUserConfig() composable
│   ├── libs/
│   │   └── rpc/             # RPC client utilities
│   └── types/               # Global type definitions
└── components/              # Base UI components
```

### Nuxt Configuration

```typescript
// layers/01-base/nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',           # UI framework
    'nuxt-typed-router',  # Typed routing
  ],
  css: ['~/assets/css/main.css'],
  // Base configuration shared by all layers
});
```

### Why "01-" Prefix?

The numeric prefix ensures:

- **Load order** - Base loads first (01 < 02)
- **Clarity** - Dependencies are obvious from numbering
- **Room for growth** - Can add 00-core or 03-features later

## Layer 02: Packages

**Path**: `layers/02-packages/`

**Purpose**: Package-specific UI components and features

**What it contains**:

- **Package components** - Cards, lists, detail views
- **Package types** - TypeScript types for package UI
- **Package pages** - Routes for package browsing

### Key Files

```
02-packages/
├── nuxt.config.ts           # Layer-specific configuration
├── app/
│   ├── components/
│   │   ├── PackageCard.vue
│   │   ├── PackageList.vue
│   │   └── PackageDetail.vue
│   ├── pages/
│   │   └── packages/
│   │       └── [id].vue
│   └── types/
│       └── package.ts
```

### Component Prefixing

```typescript
// layers/02-packages/nuxt.config.ts
export default defineNuxtConfig({
  components: [
    {
      path: "~/components",
      prefix: "Package", // All components become PackageXxx
    },
  ],
});
```

This means:

- `PackageCard.vue` -> `<PackageCard />`
- `PackageList.vue` -> `<PackageList />`
- Prevents naming collisions with other layers

## How Layers Work

### Composition

Nuxt merges layer configurations from bottom to top:

```
Layer 02 (Packages)
       ↓ (extends)
Layer 01 (Base)
       ↓ (extends)
Root nuxt.config.ts
```

### File Resolution

When you import `~/components/Foo.vue`:

1. Check current layer first
2. If not found, check parent layer (01-base)
3. Continue up the chain

This enables **override capabilities** - higher layers can replace lower layer files.

### Config Merging

Nuxt configs are merged deeply:

```typescript
// Base layer
export default {
  modules: ['@nuxt/ui'],
  css: ['base.css'],
};

// Packages layer
export default {
  modules: ['custom-module'],
  css: ['packages.css'],
};

// Result
{
  modules: ['@nuxt/ui', 'custom-module'],
  css: ['base.css', 'packages.css'],
}
```

## Directory Structure Comparison

### With Layers (Current)

```
app/
├── pages/                 # App-specific pages
└── components/           # App-specific components

layers/
├── 01-base/
│   └── app/
│       ├── components/   # Shared base components
│       ├── composables/  # useUserConfig, useRPC
│       └── plugins/      # Config plugin
└── 02-packages/
    └── app/
        ├── components/   # PackageCard, PackageList
        └── pages/        # Package pages
```

### Without Layers (Alternative)

```
app/
├── components/
│   ├── base/            # Base components
│   └── packages/        # Package components
├── composables/
│   ├── useUserConfig.ts
│   └── usePackage.ts
├── pages/
│   └── packages/
└── plugins/
    └── config.ts
```

**Why layers won**:

- Clearer separation of concerns
- Easier to understand dependencies
- Can disable/enable layers conditionally
- Better organization for larger apps

## Adding a New Layer

1. **Create directory**:

```bash
mkdir -p layers/03-analytics/app/components
```

2. **Create nuxt.config.ts**:

```typescript
// layers/03-analytics/nuxt.config.ts
export default defineNuxtConfig({
  extends: "../02-packages", // Extend previous layer
  components: [
    {
      path: "~/components",
      prefix: "Analytics",
    },
  ],
});
```

3. **Update root config**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: [
    "./layers/01-base",
    "./layers/02-packages",
    "./layers/03-analytics", // Add here
  ],
});
```

## Layer Best Practices

### DO

- Keep base layer small and focused
- Use explicit prefixes for component names
- Document layer dependencies
- Share types through base layer

### DON'T

- Create circular dependencies between layers
- Put business logic in layers (use `libs/` instead)
- Duplicate configuration between layers
- Make layers too granular (3-4 layers max)

## Server Code Organization

While the server doesn't use Nuxt layers, it follows similar organizational principles:

```
server/
├── infra/           # Infrastructure (like base layer)
│   └── config-loader/
├── providers/       # Provider adapters (domain-specific)
├── services/        # Business services
└── rpc/            # RPC routes (API layer)
```

The server uses **Effect Layers** for dependency injection, which provides similar composition benefits to Nuxt layers.

## Summary

The layer structure provides:

- **Clear organization** - Base vs. domain-specific code
- **Composable architecture** - Easy to add/remove features
- **Override capabilities** - Higher layers replace lower ones
- **Scalable structure** - Room for growth

This approach balances simplicity (for the server) with organization (for the client).