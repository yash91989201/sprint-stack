---
name: sprint-data-fetching
description: Data fetching conventions for the sprint-stack monorepo using oRPC + TanStack Query. Use when implementing ANY data fetching, API calls, useSuspenseQuery, useQuery, useMutation, queryUtils, or loading states. Covers the queryUtils pattern, query vs mutation rules, cache invalidation, and Suspense fallback skeletons. Trigger on ANY task involving fetching data, calling APIs, mutations, cache invalidation, or loading/skeleton states — even if the user just says "get data from the server."
---

# Data Fetching with oRPC + TanStack Query

## Setup

The oRPC client and queryUtils are defined in `src/lib/orpc.ts`:

```ts
import { createClient } from "@orpc/client";
import { createQueryUtils } from "@orpc/react-query";
import type { AppRouterClient } from "@/server/routers";

export const client = createClient<AppRouterClient>({ url: "/rpc" });
export const queryUtils = createQueryUtils(client);
```

- `client` → raw oRPC client (not used directly in components)
- `queryUtils` → exposes `.queryOptions` and `.mutationOptions` for every procedure, fully type-safe

## Rules

1. **Always use `queryUtils`**, not the raw `client`.
2. **Reads** → `useSuspenseQuery` (preferred) or `useQuery`.
3. **Writes** → `useMutation`.
4. **Never call procedures directly** in components.
5. **Use `queryClient.invalidateQueries` only inside mutation handlers.**
6. **All TanStack Query options** can be passed into `queryOptions` and `mutationOptions` (`staleTime`, `enabled`, `select`, `refetchOnWindowFocus`, `onSuccess`, `onError`, `retry`, etc.).
7. Inputs/outputs are always type-safe, inferred from backend schemas.

## Queries (Reads)

```tsx
const { data: blog } = useSuspenseQuery(
  queryUtils.blog.getBlog.queryOptions({ input: { slug } })
);
```

When using `useSuspenseQuery`, you must provide a Suspense fallback skeleton. See [references/suspense-fallback.md](./references/suspense-fallback.md) for the skeleton pattern.

## Mutations (Writes)

Handle side-effects (invalidation, toast, navigation) inside `onSuccess` / `onError`:

```tsx
const { mutate: joinRoom } = useMutation(
  queryUtils.room.join.mutationOptions({
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryUtils.room.getMyRooms.queryKey(),
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  })
);
```

## Authentication

- Procedures defined with `protectedProcedure` require session/auth headers.
- Normally handled automatically via cookies.
- If needed, add custom headers in `orpc.ts` with a `fetch` override.

## Suspense Fallbacks

Any component using `useSuspenseQuery` must have a corresponding skeleton component as a Suspense fallback. Read [references/suspense-fallback.md](./references/suspense-fallback.md) for the full pattern — naming convention, structural replica rules, and implementation checklist.
