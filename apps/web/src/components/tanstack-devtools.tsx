import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { pacerDevtoolsPlugin } from "@tanstack/react-pacer-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export function TanstackDevtools() {
	return (
		<TanStackDevtools
			plugins={[
				{
					defaultOpen: true,
					name: "TanStack Query",
					render: <ReactQueryDevtoolsPanel />,
				},
				{
					defaultOpen: false,
					name: "TanStack Router",
					render: <TanStackRouterDevtoolsPanel />,
				},
				formDevtoolsPlugin(),
				pacerDevtoolsPlugin(),
			]}
		/>
	);
}
