# Simple Form Boilerplate

For single-component forms with flat fields.

```tsx
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@sprint-stack/ui/components/button";
import { FieldGroup } from "@sprint-stack/ui/components/field";
import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
import { Spinner } from "@sprint-stack/ui/components/spinner";
import { ExampleFormSchema } from "@/lib/schemas/example";
import type { ExampleFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

const formOpts = formOptions({
  defaultValues: {
    name: "",
    email: "",
  } satisfies ExampleFormType as ExampleFormType,
});

export function ExampleForm() {
  const navigate = useNavigate();

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

  const form = useAppForm({
    ...formOpts,
    validators: {
      onSubmit: ExampleFormSchema,
    },
    onSubmit: async ({ value }) => {
      await createExample(value);
    },
  });

  return (
    <form.AppForm>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <field.Input
                label="Name"
                placeholder="Enter name"
              />
            )}
          </form.AppField>

          <form.AppField name="email">
            {(field) => (
              <field.Input
                label="Email"
                placeholder="Enter email"
                type="email"
              />
            )}
          </form.AppField>

          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isValidating,
              state.isSubmitting,
            ]}
          >
            {([canSubmit, isValidating, isSubmitting]) => (
              <Button
                className="w-full gap-1.5"
                disabled={!canSubmit || isValidating || isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </form.Subscribe>
        </FieldGroup>
      </form>
    </form.AppForm>
  );
}
```
