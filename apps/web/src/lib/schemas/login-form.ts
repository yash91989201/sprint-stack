import z from "zod";

export const LogInFormSchema = z.object({
	identifier: z.string().min(1, "Email or username is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const MagicLinkFormSchema = z.object({
	email: z.email("Invalid email address"),
});
