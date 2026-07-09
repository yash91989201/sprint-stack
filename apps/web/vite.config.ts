import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
	optimizeDeps: {
		exclude: ["pg"],
	},
	plugins: [
		tailwindcss(),
		tanstackStart({
			rsc: {
				enabled: true,
			},
		}),
		rsc(),
		nitro(),
		viteReact(),
		babel({
			presets: [reactCompilerPreset()],
		}),
	],
	resolve: {
		alias: {
			"pg-native": "/dev/null",
		},
		tsconfigPaths: true,
	},
	server: {
		port: 3001,
	},
	ssr: {
		external: ["pg"],
	},
});
