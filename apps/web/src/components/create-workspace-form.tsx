import { Button } from "@sprint-stack/ui/components/button";
import { FieldGroup } from "@sprint-stack/ui/components/field";
import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
import { Spinner } from "@sprint-stack/ui/components/spinner";
import { formOptions } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { CreateWorkspaceFormSchema } from "@/lib/schemas/create-workspace-form";
import type { CreateWorkspaceFormType } from "@/lib/types";

const formOpts = formOptions({
	defaultValues: {
		name: "",
	} satisfies CreateWorkspaceFormType as CreateWorkspaceFormType,
});

const submitStateSelector = (state: {
	canSubmit: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
}) => [state.canSubmit, state.isValidating, state.isSubmitting];

export default function CreateWorkspaceForm() {
	const navigate = useNavigate();

	const form = useAppForm({
		...formOpts,
		onSubmit: async ({ value }) => {
			const slug = value.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");

			const result = await authClient.organization.create({
				name: value.name,
				slug,
			});

			if (result.error) {
				toast.error(result.error.message ?? "Failed to create workspace");
				return;
			}

			toast.success("Workspace created");
			navigate({ to: "/dashboard" });
		},
		validators: {
			onSubmit: CreateWorkspaceFormSchema,
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		form.handleSubmit();
	};

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<div className="mb-6 text-center">
				<h1 className="font-bold text-2xl">Create a workspace</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Set up a workspace for your team to collaborate.
				</p>
			</div>

			<form.AppForm>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						<form.AppField name="name">
							{(field) => (
								<field.Input
									autoComplete="organization"
									autoFocus
									label="Workspace name"
									placeholder="My Team"
								/>
							)}
						</form.AppField>

						<form.Subscribe selector={submitStateSelector}>
							{([canSubmit, isValidating, isSubmitting]) => (
								<Button
									className="w-full gap-1.5"
									disabled={!canSubmit || isValidating || isSubmitting}
									type="submit"
								>
									{isSubmitting ? (
										<>
											<Spinner />
											Creating...
										</>
									) : (
										"Create workspace"
									)}
								</Button>
							)}
						</form.Subscribe>
					</FieldGroup>
				</form>
			</form.AppForm>
		</div>
	);
}
