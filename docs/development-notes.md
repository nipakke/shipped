# Development Notes

Internal documentation for developers working on this codebase.

## TanStack Query SSR Limitations

### Errored Queries Are Not Hydrated

TanStack Query intentionally does not hydrate errored queries from server to client during SSR. This behavior causes a hydration mismatch when a query errors on the server (e.g., 404 not found).

**The Problem:**
Even if you:

- Configure `shouldDehydrateQuery` to include errors
- Use a custom serializer (e.g., ORPC's `StandardRPCJsonSerializer`)
- Properly serialize/deserialize the error state

TanStack Query will still discard the errored query on the client, resulting in:

1. A hydration mismatch warning
2. An automatic client-side refetch

**The Solution:**
For queries that may error (e.g., checking if a resource exists), explicitly disable them on the server:

```typescript
const query = useQuery(
  rpc.packages.getOne.queryOptions({
    input: { packageId },
    enabled: import.meta.client, // Only run on client
    retry: 0,
  }),
);
```

This ensures the query only executes on the client, avoiding the hydration mismatch entirely.

**When to Use This:**

- Queries for resources that might not exist (404 scenarios)
- User-specific data that requires client-side authentication
- Any query where an error response is an expected outcome

**When NOT to Use This:**

- Static content that should be server-rendered for SEO
- Critical data needed for initial page render
- Queries that should error fast and fail the page load