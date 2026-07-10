import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getUser } from "@/functions/get-user";
import { getUserWorkspaces } from "@/functions/get-user-workspaces";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ location }) => {
		const session = await getUser();
		if (!session) {
			throw redirect({
				to: "/login",
			});
		}

		if (location.pathname !== "/create-workspace") {
			const { hasWorkspaces } = await getUserWorkspaces();
			if (!hasWorkspaces) {
				throw redirect({
					to: "/create-workspace",
				});
			}
		}

		return { session };
	},
	component: RouteComponent,
	loader: ({ context }) => {
		if (!context.session) {
			throw redirect({
				to: "/login",
			});
		}
	},
});

function RouteComponent() {
	return <Outlet />;
}
