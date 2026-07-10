import z from "zod";

export const TwoFactorFormSchema = z.object({
	code: z.string().length(6, "Code must be 6 digits"),
});
