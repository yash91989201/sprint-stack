import { RiGithubFill, RiGoogleFill } from "@remixicon/react";
import { Button } from "@sprint-stack/ui/components/button";
import { FieldGroup } from "@sprint-stack/ui/components/field";
import { useAppForm } from "@sprint-stack/ui/components/form/hooks";
import { Separator } from "@sprint-stack/ui/components/separator";
import { Spinner } from "@sprint-stack/ui/components/spinner";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@sprint-stack/ui/components/tabs";
import { formOptions } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { LogInFormSchema, MagicLinkFormSchema } from "@/lib/schemas/login-form";
import type { LogInFormType, MagicLinkFormType } from "@/lib/types";
import Loader from "./loader";

const signInFormOpts = formOptions({
	defaultValues: {
		identifier: "",
		password: "",
	} satisfies LogInFormType as LogInFormType,
});

const magicLinkFormOpts = formOptions({
	defaultValues: {
		email: "",
	} satisfies MagicLinkFormType as MagicLinkFormType,
});

const submitStateSelector = (state: {
	canSubmit: boolean;
	isValidating: boolean;
	isSubmitting: boolean;
}) => [state.canSubmit, state.isValidating, state.isSubmitting];

export default function LoginForm() {
	const navigate = useNavigate({ from: "/" });
	const { isPending } = authClient.useSession();

	const signInForm = useAppForm({
		...signInFormOpts,
		onSubmit: async ({ value }) => {
			const isEmail = value.identifier.includes("@");
			if (isEmail) {
				await authClient.signIn.email(
					{ email: value.identifier, password: value.password },
					{
						onError: (error) => {
							toast.error(error.error.message || error.error.statusText);
						},
						onSuccess: () => {
							navigate({ to: "/dashboard" });
							toast.success("Sign in successful");
						},
					}
				);
			} else {
				await authClient.signIn.username(
					{ password: value.password, username: value.identifier },
					{
						onError: (error) => {
							toast.error(error.error.message || error.error.statusText);
						},
						onSuccess: () => {
							navigate({ to: "/dashboard" });
							toast.success("Sign in successful");
						},
					}
				);
			}
		},
		validators: { onSubmit: LogInFormSchema },
	});

	const magicLinkForm = useAppForm({
		...magicLinkFormOpts,
		onSubmit: async ({ value }) => {
			await authClient.signIn.magicLink(
				{ callbackURL: "/dashboard", email: value.email },
				{
					onError: (error) => {
						toast.error(error.error.message || error.error.statusText);
					},
					onSuccess: () => {
						toast.success("Check your email for the magic link!");
					},
				}
			);
		},
		validators: { onSubmit: MagicLinkFormSchema },
	});

	const handleSignInSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		signInForm.handleSubmit();
	};

	const handleMagicLinkSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		magicLinkForm.handleSubmit();
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
			<h1 className="mb-6 text-center font-bold text-3xl">Welcome Back</h1>
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
			<Tabs defaultValue="signin">
				<TabsList className="w-full">
					<TabsTrigger className="flex-1" value="signin">
						Sign In
					</TabsTrigger>
					<TabsTrigger className="flex-1" value="magic-link">
						Magic Link
					</TabsTrigger>
				</TabsList>
				<TabsContent value="signin">
					<signInForm.AppForm>
						<form className="space-y-4 pt-4" onSubmit={handleSignInSubmit}>
							<FieldGroup>
								<signInForm.AppField name="identifier">
									{(field) => (
										<field.Input
											label="Email or Username"
											placeholder="Enter your email or username"
										/>
									)}
								</signInForm.AppField>
								<signInForm.AppField name="password">
									{(field) => (
										<field.Input
											label="Password"
											placeholder="Enter your password"
											type="password"
										/>
									)}
								</signInForm.AppField>
								<signInForm.Subscribe selector={submitStateSelector}>
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
												"Sign In"
											)}
										</Button>
									)}
								</signInForm.Subscribe>
							</FieldGroup>
						</form>
					</signInForm.AppForm>
				</TabsContent>
				<TabsContent value="magic-link">
					<magicLinkForm.AppForm>
						<form className="space-y-4 pt-4" onSubmit={handleMagicLinkSubmit}>
							<FieldGroup>
								<magicLinkForm.AppField name="email">
									{(field) => (
										<field.Input
											label="Email"
											placeholder="Enter your email"
											type="email"
										/>
									)}
								</magicLinkForm.AppField>
								<magicLinkForm.Subscribe selector={submitStateSelector}>
									{([canSubmit, isValidating, isSubmitting]) => (
										<Button
											className="w-full gap-1.5"
											disabled={!canSubmit || isValidating || isSubmitting}
											type="submit"
										>
											{isSubmitting ? (
												<>
													<Spinner /> Sending...
												</>
											) : (
												"Send Magic Link"
											)}
										</Button>
									)}
								</magicLinkForm.Subscribe>
							</FieldGroup>
						</form>
					</magicLinkForm.AppForm>
				</TabsContent>
			</Tabs>
			<div className="mt-4 text-center">
				<Link
					className="text-indigo-600 text-sm underline-offset-4 hover:text-indigo-800 hover:underline"
					to="/signup"
				>
					Need an account? Sign Up
				</Link>
			</div>
		</div>
	);
}
