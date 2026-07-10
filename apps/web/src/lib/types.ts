// AUTO-GENERATED FILE. DO NOT EDIT.
// Run `bun run generate:types` to refresh
import type { z } from "zod";
import type {
	LogInFormSchema,
	MagicLinkFormSchema,
	SignUpFormSchema,
	TwoFactorFormSchema,
} from "./schemas/auth";
import type { CreateWorkspaceFormSchema } from "./schemas/workspace";

export type CreateWorkspaceFormType = z.infer<typeof CreateWorkspaceFormSchema>;
export type LogInFormType = z.infer<typeof LogInFormSchema>;
export type MagicLinkFormType = z.infer<typeof MagicLinkFormSchema>;
export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
export type TwoFactorFormType = z.infer<typeof TwoFactorFormSchema>;
