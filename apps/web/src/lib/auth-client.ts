import {
	lastLoginMethodClient,
	magicLinkClient,
	multiSessionClient,
	organizationClient,
	twoFactorClient,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		organizationClient(),
		twoFactorClient({
			onTwoFactorRedirect() {
				window.location.href = "/2fa";
			},
		}),
		usernameClient(),
		magicLinkClient(),
		lastLoginMethodClient(),
		multiSessionClient(),
	],
});
