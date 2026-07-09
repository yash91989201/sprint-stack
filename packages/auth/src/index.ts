import { expo } from "@better-auth/expo";
import { createDb } from "@sprint-stack/db";
import * as schema from "@sprint-stack/db/schema/auth";
import { env } from "@sprint-stack/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

export function createAuth() {
	const db = createDb();

	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(db, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
		},
		plugins: [expo(), tanstackStartCookies()],
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
