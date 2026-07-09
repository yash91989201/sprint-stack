---
name: sprint-schema
description: Schema and type conventions for the sprint-stack monorepo. Use whenever defining Zod schemas, creating schema files, importing types, or working with @/lib/types, @/lib/schemas, or @server/lib/*. Covers schema definition with Zod, auto-generated types, file organization, and monorepo import rules. Trigger this skill on ANY task involving schemas, types, validation, or data models — even if the user doesn't explicitly say "schema."
---

# Schema Conventions

## Core Rules

1. **Always use Zod** for schema definitions. No hand-written types for data shapes.
2. **Types are auto-generated** in `src/lib/types.ts` — never edit this file manually.
3. **Import types from `@/lib/types`**, never directly from schema files.
4. **One schema per file** in `src/lib/schemas/` — no nested directories.
5. **Filenames**: lowercase with dashes or underscores (e.g., `user-form.ts`).

## Schema Definition

```ts
import { z } from "zod";

export const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0),
});
```

## Type Inference

Types are auto-generated from schemas via `z.infer`. The generator scans `src/lib/schemas/` and consolidates all types into `src/lib/types.ts`.

```ts
import type { User } from "@/lib/types";
```

Never infer types inside components — always import from `@/lib/types`.

## Monorepo Structure

This is the **web** app in a monorepo (apps: `docs`, `native`, `server`, `web`).

The **server** maintains its own parallel structure:

| Location | Contains |
|---|---|
| `server/src/lib/schemas/` | DB + oRPC schemas |
| `server/src/lib/types/` | DB + oRPC types |

**Path alias:** `"@server/lib/*": ["../server/src/lib/*"]`

### Import Rules

- Frontend schemas/types → `@/lib/schemas`, `@/lib/types`
- Backend schemas/types → `@server/lib/schemas`, `@server/lib/types`
- Use server types in frontend → import via `@server/lib/*`

## File Layout

```
src/
  lib/
    schemas/
      user.ts
      user-form.ts
    types.ts          ← auto-generated, do not edit

server/
  src/
    lib/
      schemas/
      types/
```
