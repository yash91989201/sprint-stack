import type z from "zod";
import type { CreateWorkspaceFormSchema } from "./schemas/create-workspace-form";
import type {
	LogInFormSchema,
	MagicLinkFormSchema,
} from "./schemas/login-form";
import type { SignUpFormSchema } from "./schemas/signup-form";
import type { TwoFactorFormSchema } from "./schemas/two-factor-form";

export type LogInFormType = z.infer<typeof LogInFormSchema>;
export type MagicLinkFormType = z.infer<typeof MagicLinkFormSchema>;
export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
export type TwoFactorFormType = z.infer<typeof TwoFactorFormSchema>;
export type CreateWorkspaceFormType = z.infer<typeof CreateWorkspaceFormSchema>;
