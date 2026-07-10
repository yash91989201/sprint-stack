import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import { Button } from "@sprint-stack/ui/components/button";
import { FieldGroup } from "@sprint-stack/ui/components/field";
import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
import { Separator } from "@sprint-stack/ui/components/separator";
import { Spinner } from "@sprint-stack/ui/components/spinner";
import { formOptions } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { SignUpFormSchema } from "@/lib/schemas/signup-form";
import type { SignUpFormType } from "@/lib/types";
import Loader from "./loader";

const formOpts = formOptions({
	defaultValues: {
		email: "",
		name: "",
		password: "",
		username: "",
	} satisfies SignUpFormType as SignUpFormType,
});

const submitStateSelector = (state: {
	canSubmit: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
}) => [state.canSubmit, state.isValidating, state.isSubmitting];

export default function SignupForm() {
	const navigate = useNavigate({ from: "/" });
	const { isPending } = authClient.useSession();

	const form = useAppForm({
		...formOpts,
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					name: value.name,
					password: value.password,
					username: value.username,
				},
				{
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
					onSuccess: () => {
						navigate({ to: "/dashboard" });
						toast.success("Sign up successful");
					},
				}
			);
		},
		validators: { onSubmit: SignUpFormSchema },
	});

	const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		form.handleSubmit();
	};

	const signInWithGoogle = async () => {
		await authClient.signIn.social({
			callbackURL: "/dashboard",
			provider: "google",
		});
	};

	const signInWithGithub = async () => {
		await authClient.signIn.social({
			callbackURL: "/dashboard",
			provider: "github",
		});
	};

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-center font-bold text-3xl">Create Account</h1>
			<div className="flex flex-col gap-3">
				<Button
					className="w-full"
					onClick={signInWithGoogle}
					type="button"
					variant="outline"
				>
					<RiGoogleFill className="size-4" />
					Continue with Google
				</Button>
				<Button
					className="w-full"
					onClick={signInWithGithub}
					type="button"
					variant="outline"
				>
					<RiGithubFill className="size-4" />
					Continue with GitHub
				</Button>
			</div>
			<div className="relative my-4">
				<Separator />
				<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-muted-foreground text-xs">
					or continue with
				</span>
			</div>
			<form.AppForm>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<FieldGroup>
						<form.AppField name="name">
							{(field) => (
								<field.Input label="Name" placeholder="Enter your name" />
							)}
						</form.AppField>
						<form.AppField name="username">
							{(field) => (
								<field.Input label="Username" placeholder="Choose a username" />
							)}
						</form.AppField>
						<form.AppField name="email">
							{(field) => (
								<field.Input
									label="Email"
									placeholder="Enter your email"
									type="email"
								/>
							)}
						</form.AppField>
						<form.AppField name="password">
							{(field) => (
								<field.Input
									label="Password"
									placeholder="Enter your password"
									type="password"
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
											<Spinner /> Submitting...
										</>
									) : (
										"Sign Up"
									)}
								</Button>
							)}
						</form.Subscribe>
					</FieldGroup>
				</form>
			</form.AppForm>
			<div className="mt-4 text-center">
				<Link
					className="text-indigo-600 text-sm underline-offset-4 hover:text-indigo-800 hover:underline"
					to="/login"
				>
					Already have an account? Sign In
				</Link>
			</div>
		</div>
	);
}
