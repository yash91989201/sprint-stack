import { expoClient } from "@better-auth/expo/client";
import { lastLoginMethodClient } from "@better-auth/expo/plugins";
import { env } from "@sprint-stack/env/native";
import {
	magicLinkClient,
	multiSessionClient,
	organizationClient,
	twoFactorClient,
	usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
	baseURL: env.EXPO_PUBLIC_SERVER_URL,
	plugins: [
		expoClient({
			scheme: Constants.expoConfig?.scheme as string,
			storage: SecureStore,
			storagePrefix: Constants.expoConfig?.scheme as string,
		}),
		organizationClient(),
		twoFactorClient({
			onTwoFactorRedirect() {
				// ponytail: navigate to 2fa screen when built
			},
		}),
		usernameClient(),
		magicLinkClient(),
		lastLoginMethodClient({
			storage: SecureStore,
			storagePrefix: Constants.expoConfig?.scheme as string,
		}),
		multiSessionClient(),
	],
});
