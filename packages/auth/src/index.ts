import { expo } from "@better-auth/expo";
import { createDb } from "@sprint-stack/db";
import * as schema from "@sprint-stack/db/schema/auth";
import { env } from "@sprint-stack/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	haveIBeenPwned,
	lastLoginMethod,
	magicLink,
	multiSession,
	organization,
	twoFactor,
	username,
} from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export function createAuth() {
	const db = createDb();

	return betterAuth({
		appName: "Sprint Stack",
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
		},
		plugins: [
			expo(),
			organization({
				schema: {
					organization: {
						modelName: "workspace",
					},
				},
				teams: {
					enabled: true,
				},
			}),
			tanstackStartCookies(),
			twoFactor(),
			username(),
			magicLink({
				sendMagicLink: async ({ email: _email, token: _token, url }, _ctx) => {
					await Promise.resolve();
					// TODO: integrate email service (e.g. Resend, Nodemailer)
					console.log("Magic link:", url);
				},
			}),
			haveIBeenPwned(),
			lastLoginMethod(),
			multiSession({ maximumSessions: 3 }),
		],
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [
			env.CORS_ORIGIN,
			"sprint-stack://",
			"exp://",
			"http://localhost:8081",
		],
	});
}

export const auth = createAuth();
