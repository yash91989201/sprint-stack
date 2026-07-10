import z from "zod";

export const SignUpFormSchema = z.object({
	email: z.email("Invalid email address"),
	name: z.string().min(2, "Name must be at least 2 characters"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, hyphens, and underscores"
		),
});
