import { createFileRoute } from "@tanstack/react-router";

import CreateWorkspaceForm from "@/components/create-workspace-form";

export const Route = createFileRoute("/_auth/create-workspace")({
	component: RouteComponent,
});

function RouteComponent() {
	return <CreateWorkspaceForm />;
}
