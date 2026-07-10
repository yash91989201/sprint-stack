---
name: sprint-forms
description: Form implementation conventions for the sprint-stack monorepo using TanStack Form, Zod, and custom form components. Use when building ANY form — simple or complex, form schemas, form validation, useAppForm, dynamic field arrays, or form mutations. Covers FormSchema/FormType naming, useAppForm setup, field components, and dynamic array patterns. Trigger on ANY form-related task, even if the user just says "add an input" or "create a form" or "add validation."
---

# Form Implementation with TanStack Form

## Project Structure

- **Schemas** → `src/lib/schemas/` grouped by domain (e.g., `auth.ts`, `workspace.ts`) — see the sprint-schema skill for the full rule
- **Types** → `src/lib/types.ts` (auto-generated, do not edit)
- **Form Components** → co-located in feature folders

## Schema & Type Naming

Always suffix schemas with `FormSchema` and inferred types with `FormType`:

- `LogInFormSchema` → `LogInFormType`
- `CreateOrgFormSchema` → `CreateOrgFormType`

Types are auto-generated from schemas via `z.infer`. Import from `@/lib/types`, never define types manually inside components.

## Form Setup with useAppForm

Import the custom form hook from the shared UI package:

```ts
import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
```

Initialize:

```ts
const form = useAppForm({
  defaultValues: {
    email: "",
    password: "",
  } satisfies LogInFormType as LogInFormType,
  validators: {
    onSubmit: LogInFormSchema,
  },
  onSubmit: async ({ value }) => {
    // Handle form submission
  },
});
```

Wrap with `<form.AppForm>`:

```tsx
<form.AppForm>
  <form onSubmit={(e) => {
    e.preventDefault();
    form.handleSubmit();
  }}>
    {/* fields */}
  </form>
</form.AppForm>
```

## Mutations & Submissions

- Always use `useMutation` with `queryUtils.*.mutationOptions()`.
- Handle side effects (`toast`, `invalidateQueries`, `navigate`) in mutation callbacks.
- For auth operations, use `authClient` directly.

```tsx
const { mutateAsync: createExample } = useMutation(
  queryUtils.example.create.mutationOptions({
    onSuccess: () => {
      toast.success("Form submitted successfully");
      form.reset();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    },
  })
);
```

## UX Rules

1. **Buttons**
   - `<button>` defaults to `type="submit"`.
   - Use `type="button"` for non-submit actions (cancel, add, remove).
   - Use `type="reset"` for reset actions.
   - Omit `type` when the button should submit the form.
2. **Validation** → errors are automatically displayed via the `FormBase` wrapper.
3. **Loading state** → use `form.Subscribe` to access `canSubmit`, `isSubmitting`, `isValidating`.
4. **Reset** → call `form.reset()` after successful submission or pass handler to `onReset` prop.

## Available Field Components

The custom form wrapper provides these field components:

- `field.Input` — Text input
- `field.Textarea` — Textarea
- `field.Select` — Select dropdown
- `field.Checkbox` — Checkbox
- `field.FileInput` — File upload (single or multiple)
- `field.InputGroup` — Input with addons
- `field.InputGroupInput` — Input within InputGroup
- `field.InputGroupTextarea` — Textarea within InputGroup
- `field.InputGroupSpinner` — Shows spinner when field is validating

All field components accept:

- `label` (required) — Field label
- `description` (optional) — Help text below field
- Plus all standard HTML input props

## Simple vs Complex Forms

- **Simple form** (single component, flat fields) → see [references/simple-form.md](./references/simple-form.md) for full boilerplate.
- **Complex form** (nested objects, dynamic arrays, multi-section) → see [references/complex-form.md](./references/complex-form.md) for full boilerplate including `useFieldArray`, conditional fields, and checkbox arrays.

## Key Patterns

### Error Handling in onSubmit

```tsx
onSubmit: async ({ value }) => {
  try {
    await createExample(value);
  } catch (err) {
    form.setFieldMeta("email", (prev) => ({
      ...prev,
      errorMap: {
        onSubmit: err instanceof Error ? err.message : "Submission failed",
      },
    }));
  }
}
```

### Async Validation with Zod

Use `.refine()` with async functions:

```ts
const schema = z.object({
  username: z.string()
    .min(3)
    .refine(async (val) => {
      const { data } = await checkAvailability(val);
      return data?.available ?? false;
    }, {
      message: "Username already taken",
    }),
});
```

### Conditional (Cross-field) Validation

```ts
const schema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

### Conditional Fields Based on Form State

Use `useStore` from `@tanstack/react-store`:

```tsx
import { useStore } from "@tanstack/react-store";

const channelType = useStore(form.store, (state) => state.values.type);

{channelType === "team" ? (
  <TeamSelect form={form} />
) : (
  <GroupSelect form={form} />
)}
```
