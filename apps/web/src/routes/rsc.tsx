import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";

function ServerTimestamp() {
	return (
		<time dateTime={new Date().toISOString()}>{new Date().toISOString()}</time>
	);
}

const getServerGreeting = createServerFn({ method: "GET" }).handler(
	async () => {
		const Renderable = await renderServerComponent(<ServerTimestamp />);
		return { Renderable };
	}
);

export const Route = createFileRoute("/rsc")({
	loader: async () => {
		const { Renderable } = await getServerGreeting();
		return { Greeting: Renderable };
	},
	component: RscDemoPage,
});

function RscDemoPage() {
	const { Greeting } = Route.useLoaderData();

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<div className="rounded-lg border p-4">
				<h1 className="mb-2 font-medium">React Server Component</h1>
				<p className="text-muted-foreground text-sm">
					Rendered on the server: <span className="font-mono">{Greeting}</span>
				</p>
			</div>
		</div>
	);
}
