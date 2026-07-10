import { Button } from "@sprint-stack/ui/components/button";
import { FieldGroup } from "@sprint-stack/ui/components/field";
import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@sprint-stack/ui/components/input-otp";
import { Spinner } from "@sprint-stack/ui/components/spinner";
import { formOptions } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { TwoFactorFormSchema } from "@/lib/schemas/auth";
import type { TwoFactorFormType } from "@/lib/types";

export const Route = createFileRoute("/2fa")({
	component: TwoFactorPage,
});

const formOpts = formOptions({
	defaultValues: {
		code: "",
	} satisfies TwoFactorFormType as TwoFactorFormType,
});

const submitStateSelector = (state: {
	canSubmit: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
}) => [state.canSubmit, state.isValidating, state.isSubmitting];

function TwoFactorPage() {
	const navigate = useNavigate();

	const form = useAppForm({
		...formOpts,
		onSubmit: async ({ value }) => {
			await authClient.twoFactor.verifyTotp(
				{ code: value.code },
				{
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
					onSuccess: () => {
						navigate({ to: "/dashboard" });
						toast.success("Two-factor authentication verified");
					},
				}
			);
		},
		validators: { onSubmit: TwoFactorFormSchema },
	});

	const handleSubmit = useCallback(
		(e: React.SubmitEvent<HTMLFormElement>) => {
			e.preventDefault();
			form.handleSubmit();
		},
		[form]
	);

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-2 text-center font-bold text-3xl">
				Two-Factor Authentication
			</h1>
			<p className="mb-6 text-center text-muted-foreground text-sm">
				Enter the 6-digit code from your authenticator app
			</p>
			<form.AppForm>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<FieldGroup>
						<form.AppField name="code">
							{(field) => (
								<div className="flex justify-center">
									<InputOTP
										maxLength={6}
										onBlur={field.handleBlur}
										onChange={field.handleChange}
										value={field.state.value}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} />
											<InputOTPSlot index={1} />
											<InputOTPSlot index={2} />
										</InputOTPGroup>
										<InputOTPSeparator />
										<InputOTPGroup>
											<InputOTPSlot index={3} />
											<InputOTPSlot index={4} />
											<InputOTPSlot index={5} />
										</InputOTPGroup>
									</InputOTP>
								</div>
							)}
						</form.AppField>
						{form.state.errors.length > 0 && (
							<p className="text-center text-destructive text-sm">
								{Object.values(form.state.errors[0] ?? {})[0]?.[0]?.message}
							</p>
						)}
						<form.Subscribe selector={submitStateSelector}>
							{([canSubmit, isValidating, isSubmitting]) => (
								<Button
									className="w-full gap-1.5"
									disabled={!canSubmit || isValidating || isSubmitting}
									type="submit"
								>
									{isSubmitting ? (
										<>
											<Spinner /> Verifying...
										</>
									) : (
										"Verify Code"
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
