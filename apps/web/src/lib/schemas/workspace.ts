import z from "zod";

export const CreateWorkspaceFormSchema = z.object({
	name: z
		.string()
		.min(1, "Workspace name is required")
		.max(50, "Workspace name must be 50 characters or less"),
});
