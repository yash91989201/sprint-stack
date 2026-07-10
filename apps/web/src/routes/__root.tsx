import { Toaster } from "@sprint-stack/ui/components/sonner";
import { TooltipProvider } from "@sprint-stack/ui/components/tooltip";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { evlogErrorHandler } from "evlog/nitro/v3";
import Header from "@/components/header";
import { TanstackDevtools } from "@/components/tanstack-devtools";
import appCss from "@/index.css?url";
import type { orpcClient, queryUtils } from "@/utils/orpc";

export interface RouterAppContext {
	orpcClient: typeof orpcClient;
	queryClient: QueryClient;
	queryUtils: typeof queryUtils;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootDocument,
	head: () => ({
		links: [
			{
				href: appCss,
				rel: "stylesheet",
			},
		],
		meta: [
			{
				charSet: "utf-8",
			},
			{
				content: "width=device-width, initial-scale=1",
				name: "viewport",
			},
			{
				title: "Sprint Stack",
			},
		],
	}),
	server: {
		middleware: [createMiddleware().server(evlogErrorHandler)],
	},
	shellComponent: ShellComponent,
});

function ShellComponent({ children }: { children: React.ReactNode }) {
	return (
		<html className="dark" lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<TooltipProvider>
					{children}
					<Scripts />
				</TooltipProvider>
			</body>
		</html>
	);
}

function RootDocument() {
	return (
		<>
			<div className="grid h-svh grid-rows-[auto_1fr]">
				<Header />
				<Outlet />
			</div>
			<Toaster richColors />
			<TanstackDevtools />
		</>
	);
}
