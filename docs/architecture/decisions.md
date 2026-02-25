# Key Design Decisions

This document explains the rationale behind major architectural decisions. Understanding these choices helps contributors align with the project's philosophy.

## 1. Why YAML for Configuration?

### Decision

Use YAML files in a `config/` directory instead of a database or JSON files.

### Alternatives Considered

**Database (PostgreSQL, SQLite)**

- Pros: ACID transactions, relational data, well-understood
- Cons: Requires migration system, harder to backup/restore, no hot-reloading

**JSON Files**

- Pros: Native JS support, simple parsing
- Cons: No comments, stricter syntax, harder to read/write

**Environment Variables**

- Pros: 12-factor app compliant, easy to change
- Cons: Limited structure, cannot represent nested data well

### Why YAML Won

1. **Human-readable** - Comments, clean syntax
2. **Hot-reloadable** - File watchers work naturally
3. **Editable** - Users can edit directly on the server
4. **Structured** - Supports complex nested data
5. **Atomic updates** - Replace whole file without partial states

### Trade-offs

- **No transactions** - Partial file updates possible
- **No validation at write** - Invalid files fail at load time
- **File permissions** - Must secure config directory

## 2. Why Effect TS on Server?

### Decision

Use Effect TS for all server-side business logic instead of traditional async/await with try/catch.

### Alternatives Considered

**Plain TypeScript with try/catch**

```typescript
try {
  const result = await fetchData();
  return result;
} catch (e) {
  logger.error(e);
  throw e;
}
```

- Pros: Standard JS, familiar to all developers
- Cons: Implicit errors, hard to compose, easy to miss catches

**fp-ts**

- Pros: Mature functional programming library
- Cons: Verbose, harder to learn, less ecosystem support

### Why Effect Won

1. **Typed errors** - Every error is in the type signature
2. **Composability** - Effects chain and combine safely
3. **Resource safety** - Automatic cleanup with `Effect.acquireUseRelease`
4. **Concurrency** - Built-in tools for parallel execution
5. **Testing** - Easy to mock and test with `Effect.provide`

### Example Comparison

**Without Effect:**

```typescript
async function getPackage(id: string): Promise<Package> {
  try {
    const config = await getConfig();
    const pkg = config.packages.get(id);
    if (!pkg) throw new PackageNotFoundError(id);

    const cached = await cache.get(id);
    if (cached) return cached;

    const data = await fetchFromAPI(pkg);
    await cache.set(id, data);
    return data;
  } catch (e) {
    // Did I catch everything? Who knows!
    throw e;
  }
}
```

**With Effect:**

```typescript
const getPackage = (id: string): Effect.Effect<Package, PackageError> =>
  Effect.gen(function* () {
    const config = yield* ConfigService;
    const pkg = yield* config.getPackage(id).pipe(Effect.mapError(() => new PackageNotFoundError({ id })));

    const cached = yield* CacheService.get(id);
    if (cached._tag === "Some") return cached.value;

    const data = yield* ProviderService.fetch(pkg);
    yield* CacheService.set(id, data);
    return data;
  });
```

### Trade-offs

- **Learning curve** - Team must learn Effect patterns
- **Verbosity** - More code for simple operations
- **Debugging** - Stack traces can be complex

## 3. Why Hash-Based Package IDs?

### Decision

Identify packages by a hash of their complete configuration, not by name.

### Alternatives Considered

**Name-based IDs**

- `/api/packages/vuejs/vue`
- Pros: Simple, human-readable
- Cons: Insecure, cache invalidation issues

**Database IDs**

- `/api/packages/12345`
- Pros: Compact, database-native
- Cons: Requires database, not self-describing

### Why Hash-Based Won

1. **Security** - Only configured packages can be queried
2. **Cache invalidation** - Config changes change the hash
3. **Self-describing** - Hash contains full config context
4. **Stateless** - No database needed

### Security Benefit

Without hash validation:

```
GET /api/packages/any-package-i-want  # 200 OK
```

With hash validation:

```
GET /api/packages/valid-hash-only     # 200 OK
GET /api/packages/arbitrary-string    # 404 Not Found
```

### Trade-offs

- **Longer URLs** - Hashes are not human-readable
- **Debugging** - Harder to identify packages from IDs
- **Dev mode complexity** - Different hash format for readability

## 4. Why SSE Over WebSockets?

### Decision

Use Server-Sent Events (SSE) for real-time config updates instead of WebSockets.

### Alternatives Considered

**WebSockets**

- Pros: Bidirectional, lower latency, well-supported
- Cons: Harder to scale, firewall issues, overkill for one-way data

**Polling**

- Pros: Simple, works everywhere
- Cons: Wasteful, delayed updates, harder on server

**Long Polling**

- Pros: Works with HTTP infrastructure
- Cons: Complex implementation, connection management

### Why SSE Won

1. **One-way stream** - Perfect for config updates (server -> client only)
2. **HTTP-based** - Works through proxies, load balancers
3. **Simple reconnection** - Built into EventSource API
4. **Less overhead** - No WebSocket handshake per client
5. **Type safety** - Works well with ORPC streaming

### Trade-offs

- **Browser limits** - Max 6 connections per domain (mitigated by single stream)
- **No IE support** - IE does not support EventSource (acceptable in 2024)
- **Binary data** - Less efficient for binary (not needed here)

## 5. Why Effect Schema and Zod for Validation?

### Decision

Use a hybrid validation approach: **Effect Schema** for server-side validation and business logic, and **Zod v4** for client/contract boundaries (RPC inputs/outputs).

### Alternatives Considered

**Effect Schema Exclusively**

- Pros: Single validation library throughout, native Effect integration
- Cons: Slower compilation/type inference on the frontend, less familiar for pure frontend developers, ecosystem is smaller than Zod's.

**Zod Exclusively**

- Pros: Popular, great DX, excellent error messages, widely used on frontends
- Cons: Doesn't integrate natively with Effect TS error handling or data types (like Option/Either) on the server.

**io-ts**

- Pros: Functional approach, fp-ts integration
- Cons: Verbose, complex error handling, largely superseded by Effect Schema.

### Why the Hybrid Approach Won

1. **Best of Both Worlds** - Effect Schema perfectly complements Effect TS on the backend, while Zod provides the best developer experience on the frontend and for defining RPC contracts.
2. **Performance** - Zod compiles quickly and is very lightweight for the client bundle.
3. **Integration** - Native Effect integration on the server, ensuring robust typed errors and composability where it matters most.
4. **Familiarity** - Zod is the industry standard for Vue/Nuxt client-side validation and form handling.

### Usage Pattern

**Server-Side (Effect Schema):**

```typescript
import { Schema } from "effect";

// Define schema for server-side logic/config
const PackageConfig = Schema.Struct({
  name: Schema.String,
  provider: Schema.String,
  extra: Schema.optionalWith(Schema.Record({ key: Schema.String, value: Schema.Unknown }), {
    default: () => ({}),
  }),
});

// Runtime validation in Effect pipelines
const validatePackage = (data: unknown) =>
  Schema.decodeUnknown(PackageConfig)(data).pipe(Effect.mapError((e) => new ValidationError({ cause: e })));
```

**Client/Contract Boundaries (Zod v4):**

```typescript
import { z } from "zod/v4";

// Define contract for RPC boundaries
export const PackageRef = z.object({
  provider: z.string(),
  name: z.string(),
});

export type PackageRef = z.infer<typeof PackageRef>;
```

### Trade-offs

- **Two Libraries** - Developers must learn both Effect Schema and Zod API surfaces.
- **Duplication** - Occasionally, a concept might need to be represented in both Effect Schema (for backend processing) and Zod (for API contracts), though this is minimized by keeping clear boundaries.

## 6. Why libs/ vs server/libs/ Split?

### Decision

Separate shared domain code (`libs/`) from server-only infrastructure (`server/libs/`).

### Alternatives Considered

**Single libs/ directory**

- Pros: Simpler structure, one import path
- Cons: Risk of bundling server code to client

**Everything in server/**

- Pros: Clear server ownership
- Cons: Cannot share types with client

### Why Split Won

1. **Type sharing** - Domain types available on both sides
2. **View classes** - Shared computation logic
3. **No accidental bundling** - Server code stays server-only
4. **Clear boundaries** - Explicit client/server split

### What Goes Where

**`libs/` - Shared domain logic:**

- Config schemas and view classes
- Package types
- Provider types
- Utility functions

**`server/libs/` - Server infrastructure:**

- Cache implementations
- File system utilities
- YAML parsing
- Error types
- Chokidar wrapper

### Trade-offs

- **Duplicate directory** - Two `libs/` directories can confuse
- **Import path differences** - `~/libs/` vs `~~/server/libs/`
- **Mental overhead** - Must decide where new code goes

## 7. Why No Database?

### Decision

Use in-memory + file-based caching instead of a database.

### Alternatives Considered

**PostgreSQL**

- Pros: ACID, relational, powerful queries
- Cons: Deployment complexity, connection management, overkill for cache

**SQLite**

- Pros: File-based, simple deployment
- Cons: Concurrency issues, still needs schema migrations

**Redis**

- Pros: Fast, good for caching
- Cons: Additional service to deploy and manage

### Why No Database Won

1. **Simplicity** - No database to deploy, backup, or maintain
2. **Statelessness** - Server can restart without data loss (cache repopulates)
3. **Performance** - In-memory cache is faster than database queries
4. **Deterministic** - Same config always produces same results
5. **Self-hosted friendly** - One less thing to configure

### What About Data Persistence?

- **Config** - Stored in YAML files
- **Cache** - L2 file cache survives restarts
- **State** - There is no mutable state, only cache

### Trade-offs

- **No querying** - Cannot do SQL queries on cached data
- **Cache misses** - Cold start requires API calls
- **No relations** - Cannot do joins (not needed for this use case)

## 8. Why Custom Cache Over Off-the-Shelf?

### Decision

Implement custom caching layer using BentoCache instead of Redis or database cache.

### Why Custom Won

1. **No external dependencies** - No Redis server to manage
2. **Multi-layer** - L1 (memory) + L2 (file) out of the box
3. **Type safety** - Effect wrapper provides typed interface
4. **Request coalescing** - Built into implementation
5. **Flexible backends** - Can swap to Redis later if needed

### Architecture

```typescript
// L1: In-memory Map (fast, ephemeral)
const l1Cache = new Map<string, CacheEntry>();

// L2: BentoCache with file backend (slower, persistent)
const l2Cache = new BentoCache({
  stores: [
    {
      driver: fileDriver({ path: "./.cache" }),
    },
  ],
});

// Request coalescing
const pending = new Map<string, Promise<unknown>>();
```

### Trade-offs

- **Not distributed** - Single server only (fine for self-hosted)
- **Memory limits** - L1 cache bounded by available RAM
- **Complexity** - Must maintain cache implementation

## 9. Why ORPC for RPC?

### Decision

Use ORPC for type-safe RPC between client and server.

### Alternatives Considered

**tRPC**

- Pros: Popular, excellent TypeScript support
- Cons: Complex setup with Nuxt, larger bundle size

**GraphQL**

- Pros: Flexible queries, great tooling
- Cons: Overkill for simple CRUD, requires learning curve

**REST API**

- Pros: Simple, universally understood
- Cons: No type safety across client/server boundary

### Why ORPC Won

1. **Type safety** - End-to-end type inference
2. **Nuxt integration** - Works well with Nitro server
3. **Streaming** - Built-in SSE support
4. **Lightweight** - Smaller than tRPC
5. **Schema validation** - Integrates seamlessly with Zod for robust client-server contracts

### Example

```typescript
// server/rpc/package.ts
import { z } from "zod/v4";

export const packageRouter = o.router({
  getOneById: o.procedure
    .input(z.object({ id: z.string() }))
    // output schema could be Zod or Effect Schema depending on configuration
    .handler(({ input }) =>
      Effect.gen(function* () {
        const service = yield* PackageService;
        return yield* service.getOneById(input.id);
      }),
    ),
});

// client composable - fully typed!
const rpc = useRPC();
const { data } = useQuery({
  queryKey: ["package", packageId],
  queryFn: () => rpc.package.getOneById.call({ packageId }),
});
// data is typed as Package | undefined
```

### Trade-offs

- **Newer library** - Less ecosystem than tRPC
- **Documentation** - Smaller community
- **Debugging** - Harder to inspect than REST

## 10. Why File Watching for Config?

### Decision

Use chokidar to watch config files and reload automatically instead of requiring restart.

### Alternatives Considered

**Require restart**

- Pros: Simpler implementation, no hot-reload complexity
- Cons: Poor UX, interrupt users

**API endpoints for config changes**

- Pros: Controlled updates, validation
- Cons: Requires UI, more complex, loses file editing benefit

### Why File Watching Won

1. **Instant feedback** - Changes reflect immediately
2. **Natural workflow** - Edit file, see result
3. **No UI needed** - Simple configuration management
4. **Atomic updates** - Whole file replaced at once

### Implementation

```typescript
const watcher = chokidar.watch("./config/*.yaml");

watcher.on(
  "change",
  debounce((path) => {
    reloadConfig().catch((e) => {
      logger.error("Config reload failed", e);
      // Keep old config, do not crash
    });
  }, 300),
);
```

### Trade-offs

- **Complexity** - Must handle concurrent updates
- **Errors** - Partial writes can cause temporary errors
- **Testing** - Harder to test than static config

## Summary

These decisions prioritize:

1. **Self-hosted simplicity** - No external dependencies (DB, Redis)
2. **Type safety** - Effect TS and Effect Schema throughout
3. **Developer experience** - File-based config, hot reloading
4. **Performance** - In-memory caching, request coalescing
5. **Security** - Hash-based IDs, no arbitrary queries

The architecture is optimized for a single-server deployment where simplicity and reliability matter more than horizontal scaling.