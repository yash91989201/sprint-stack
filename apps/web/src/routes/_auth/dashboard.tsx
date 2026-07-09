import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { queryUtils } from "@/utils/orpc";

export const Route = createFileRoute("/_auth/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	const privateData = useQuery(queryUtils.privateData.queryOptions());

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {session?.user.name}</p>
			<p>API: {privateData.data?.message}</p>
		</div>
	);
}
