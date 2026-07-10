import { db } from "@sprint-stack/db";
import { member } from "@sprint-stack/db/schema/auth";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { authMiddleware } from "@/middleware/auth";

export const getUserWorkspaces = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		const user = context.session?.user;
		if (!user) {
			return { hasWorkspaces: false };
		}

		const memberships = await db
			.select({ id: member.id })
			.from(member)
			.where(eq(member.userId, user.id));

		return { hasWorkspaces: memberships.length > 0 };
	});
