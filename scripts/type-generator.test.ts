import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	statSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	type GenerationSummary,
	generateWorkspaceTypes,
	parseCliArgs,
	type Scheduler,
	type TypeWatcher,
	watchWorkspaceTypes,
} from "./type-generator";

let root: string;

beforeEach(() => {
	root = mkdtempSync(path.join(tmpdir(), "type-gen-"));
});

afterEach(() => {
	rmSync(root, { force: true, recursive: true });
});

function writeFile(relPath: string, content: string): void {
	const full = path.join(root, relPath);
	mkdirSync(path.dirname(full), { recursive: true });
	writeFileSync(full, content);
}

function mkdirEmpty(relPath: string): void {
	mkdirSync(path.join(root, relPath), { recursive: true });
}

function read(relPath: string): string {
	return readFileSync(path.join(root, relPath), "utf-8");
}

function exists(relPath: string): boolean {
	return existsSync(path.join(root, relPath));
}

const HEADER_FIRST = "// AUTO-GENERATED FILE. DO NOT EDIT.";
const HEADER_SECOND = "// Run `bun run generate:types` to refresh";
const HEADER = `${HEADER_FIRST}\n${HEADER_SECOND}`;

describe("generateWorkspaceTypes", () => {
	test("discovers and generates types across nested workspaces", () => {
		writeFile(
			"package.json",
			JSON.stringify({
				workspaces: { packages: ["packages/*", "!packages/excluded"] },
			})
		);
		writeFile("packages/alpha/package.json", '{"name":"alpha"}');
		writeFile("packages/beta/package.json", '{"name":"beta"}');
		writeFile("packages/empty/package.json", '{"name":"empty"}');
		writeFile("packages/no-schemas/package.json", '{"name":"no-schemas"}');
		writeFile("packages/excluded/package.json", '{"name":"excluded"}');
		writeFile(
			"packages/alpha/src/lib/schemas/account.ts",
			'import { z } from "zod";\nexport const AlphaSchema = z.object({});\nexport const AlphaInput = z.object({});\n'
		);
		writeFile(
			"packages/alpha/src/lib/schemas/nested/admin.ts",
			'import { z } from "zod";\nexport const ZuluOutput = z.object({});\n'
		);
		writeFile(
			"packages/beta/src/lib/schemas/billing.ts",
			'import { z } from "zod";\nexport const BetaSchema = z.object({});\n'
		);
		mkdirEmpty("packages/empty/src/lib/schemas");
		writeFile(
			"packages/excluded/src/lib/schemas/secret.ts",
			'import { z } from "zod";\nexport const SecretSchema = z.object({});\n'
		);

		const summary = generateWorkspaceTypes(root);

		expect(summary.generated).toEqual([
			"packages/alpha",
			"packages/beta",
			"packages/empty",
		]);
		expect(summary.unchanged).toEqual([]);
		expect(summary.skipped).toEqual(["packages/no-schemas"]);

		expect(exists("packages/excluded/src/lib/types.ts")).toBe(false);
		expect(exists("packages/no-schemas/src/lib/types.ts")).toBe(false);

		const alphaExpected = [
			HEADER_FIRST,
			HEADER_SECOND,
			`import type { z } from "zod";`,
			`import type { AlphaInput, AlphaSchema } from "./schemas/account";`,
			`import type { ZuluOutput } from "./schemas/nested/admin";`,
			"",
			"export type AlphaInputType = z.infer<typeof AlphaInput>;",
			"export type AlphaType = z.infer<typeof AlphaSchema>;",
			"export type ZuluOutputType = z.infer<typeof ZuluOutput>;",
			"",
		].join("\n");
		expect(read("packages/alpha/src/lib/types.ts")).toBe(alphaExpected);

		const betaExpected = [
			HEADER_FIRST,
			HEADER_SECOND,
			`import type { z } from "zod";`,
			`import type { BetaSchema } from "./schemas/billing";`,
			"",
			"export type BetaType = z.infer<typeof BetaSchema>;",
			"",
		].join("\n");
		expect(read("packages/beta/src/lib/types.ts")).toBe(betaExpected);

		const emptyExpected = `${HEADER}\n`;
		expect(read("packages/empty/src/lib/types.ts")).toBe(emptyExpected);
	});

	test("second run reports all as unchanged and does not rewrite files", () => {
		writeFile(
			"package.json",
			JSON.stringify({
				workspaces: { packages: ["packages/*", "!packages/excluded"] },
			})
		);
		writeFile("packages/alpha/package.json", '{"name":"alpha"}');
		writeFile("packages/beta/package.json", '{"name":"beta"}');
		writeFile("packages/empty/package.json", '{"name":"empty"}');
		writeFile("packages/no-schemas/package.json", '{"name":"no-schemas"}');
		writeFile("packages/excluded/package.json", '{"name":"excluded"}');
		writeFile(
			"packages/alpha/src/lib/schemas/account.ts",
			'import { z } from "zod";\nexport const AlphaSchema = z.object({});\nexport const AlphaInput = z.object({});\n'
		);
		writeFile(
			"packages/beta/src/lib/schemas/billing.ts",
			'import { z } from "zod";\nexport const BetaSchema = z.object({});\n'
		);
		mkdirEmpty("packages/empty/src/lib/schemas");

		generateWorkspaceTypes(root);

		// Set a known past mtime so any rewrite advances past it. utimesSync
		// avoids real-clock waits and stays deterministic on any FS resolution.
		const knownMtime = new Date(2000, 0, 1);
		const alphaPath = path.join(root, "packages/alpha/src/lib/types.ts");
		const betaPath = path.join(root, "packages/beta/src/lib/types.ts");
		const emptyPath = path.join(root, "packages/empty/src/lib/types.ts");
		utimesSync(alphaPath, knownMtime, knownMtime);
		utimesSync(betaPath, knownMtime, knownMtime);
		utimesSync(emptyPath, knownMtime, knownMtime);
		const mtimeBeforeAlpha = statSync(alphaPath).mtimeMs;
		const mtimeBeforeBeta = statSync(betaPath).mtimeMs;
		const mtimeBeforeEmpty = statSync(emptyPath).mtimeMs;
		expect(mtimeBeforeAlpha).toBe(knownMtime.getTime());

		const summary2 = generateWorkspaceTypes(root);
		expect(summary2.generated).toEqual([]);
		expect(summary2.unchanged).toEqual([
			"packages/alpha",
			"packages/beta",
			"packages/empty",
		]);
		expect(summary2.skipped).toEqual(["packages/no-schemas"]);

		expect(statSync(alphaPath).mtimeMs).toBe(mtimeBeforeAlpha);
		expect(statSync(betaPath).mtimeMs).toBe(mtimeBeforeBeta);
		expect(statSync(emptyPath).mtimeMs).toBe(mtimeBeforeEmpty);
	});

	test("accepts array-form workspaces", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/gamma/package.json", '{"name":"gamma"}');
		writeFile(
			"packages/gamma/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const summary = generateWorkspaceTypes(root);
		expect(summary.generated).toEqual(["packages/gamma"]);
		expect(summary.unchanged).toEqual([]);
		expect(summary.skipped).toEqual([]);

		const expected = [
			HEADER_FIRST,
			HEADER_SECOND,
			`import type { z } from "zod";`,
			`import type { FooSchema } from "./schemas/foo";`,
			"",
			"export type FooType = z.infer<typeof FooSchema>;",
			"",
		].join("\n");
		expect(read("packages/gamma/src/lib/types.ts")).toBe(expected);
	});

	test("throws on duplicate schema export across files", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/dup/package.json", '{"name":"dup"}');
		writeFile(
			"packages/dup/src/lib/schemas/a.ts",
			'import { z } from "zod";\nexport const UserSchema = z.object({});\n'
		);
		writeFile(
			"packages/dup/src/lib/schemas/b.ts",
			'import { z } from "zod";\nexport const UserSchema = z.object({});\n'
		);

		expect(() => generateWorkspaceTypes(root)).toThrow(
			'Duplicate schema export "UserSchema" in workspace packages/dup: packages/dup/src/lib/schemas/a.ts and packages/dup/src/lib/schemas/b.ts'
		);
		expect(exists("packages/dup/src/lib/types.ts")).toBe(false);
	});

	test("throws on distinct schema names that map to the same generated type", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/dup2/package.json", '{"name":"dup2"}');
		writeFile(
			"packages/dup2/src/lib/schemas/a.ts",
			'import { z } from "zod";\nexport const UserInput = z.object({});\n'
		);
		writeFile(
			"packages/dup2/src/lib/schemas/b.ts",
			'import { z } from "zod";\nexport const UserInputSchema = z.object({});\n'
		);

		expect(() => generateWorkspaceTypes(root)).toThrow(
			'Duplicate generated type "UserInputType" in workspace packages/dup2: from UserInput (packages/dup2/src/lib/schemas/a.ts) and UserInputSchema (packages/dup2/src/lib/schemas/b.ts)'
		);
		expect(exists("packages/dup2/src/lib/types.ts")).toBe(false);
	});
});

describe("watchWorkspaceTypes", () => {
	let watcher: TypeWatcher | null = null;

	afterEach(() => {
		watcher?.close();
		watcher = null;
	});

	function createFakeScheduler(): Scheduler & {
		pending: number;
		tick: () => void;
	} {
		const queue = new Map<number, () => void>();
		let nextId = 1;

		return {
			clearTimeout(handle: NodeJS.Timeout) {
				const id = Number(handle);
				queue.delete(id);
			},
			get pending() {
				return queue.size;
			},
			setTimeout(callback: () => void, _ms?: number): NodeJS.Timeout {
				const id = nextId;
				nextId += 1;
				queue.set(id, callback);
				return {
					hasRef() {
						return true;
					},
					ref() {
						return this;
					},
					refresh() {
						return this;
					},
					unref() {
						return this;
					},
					[Symbol.dispose]() {
						// no-op
					},
					[Symbol.toPrimitive]() {
						return id;
					},
				};
			},
			tick() {
				const pending = [...queue.values()];
				queue.clear();
				for (const callback of pending) {
					callback();
				}
			},
		};
	}

	function createFakeWatcher() {
		const watchers = new Map<
			string,
			{
				close: () => void;
				listener: (eventType: string, filename: string | Buffer | null) => void;
			}
		>();

		return {
			createWatcher: (
				target: string,
				_options: { recursive: true },
				listener: (eventType: string, filename: string | Buffer | null) => void
			) => {
				const entry = {
					close() {
						watchers.delete(target);
					},
					listener,
				};
				watchers.set(target, entry);
				return entry;
			},
			emit(target: string, eventType: string, filename: string | null) {
				const entry = watchers.get(target);
				if (entry) {
					entry.listener(eventType, filename);
				}
			},
			has(target: string) {
				return watchers.has(target);
			},
			get paths() {
				return [...watchers.keys()];
			},
			get size() {
				return watchers.size;
			},
		};
	}

	describe("parseCliArgs", () => {
		test("defaults to watch false and 200ms debounce", () => {
			expect(parseCliArgs([])).toEqual({ debounceMs: 200, watch: false });
		});

		test("enables watch with --watch", () => {
			expect(parseCliArgs(["--watch"])).toEqual({
				debounceMs: 200,
				watch: true,
			});
		});

		test("enables watch with -w", () => {
			expect(parseCliArgs(["-w"])).toEqual({ debounceMs: 200, watch: true });
		});

		test("parses --debounce <ms>", () => {
			expect(parseCliArgs(["--debounce", "300"])).toEqual({
				debounceMs: 300,
				watch: false,
			});
		});

		test("parses --debounce-ms <ms>", () => {
			expect(parseCliArgs(["--debounce-ms", "500"])).toEqual({
				debounceMs: 500,
				watch: false,
			});
		});

		test("combines --watch and --debounce", () => {
			expect(parseCliArgs(["--watch", "--debounce", "400"])).toEqual({
				debounceMs: 400,
				watch: true,
			});
		});

		test("falls back to 200 for invalid debounce", () => {
			expect(parseCliArgs(["--debounce", "nope"])).toEqual({
				debounceMs: 200,
				watch: false,
			});
		});

		test("falls back to 200 for non-positive debounce", () => {
			expect(parseCliArgs(["--debounce", "0"])).toEqual({
				debounceMs: 200,
				watch: false,
			});
			expect(parseCliArgs(["--debounce", "-50"])).toEqual({
				debounceMs: 200,
				watch: false,
			});
		});
	});

	test("initial generation runs and creates watchers only for schemas dirs", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/with/package.json", '{"name":"with"}');
		writeFile(
			"packages/with/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);
		writeFile("packages/without/package.json", '{"name":"without"}');

		const scheduler = createFakeScheduler();
		const fake = createFakeWatcher();
		watcher = watchWorkspaceTypes(root, {
			createWatcher: fake.createWatcher,
			scheduler,
		});

		expect(exists("packages/with/src/lib/types.ts")).toBe(true);
		expect(exists("packages/without/src/lib/types.ts")).toBe(false);
		expect(fake.paths).toEqual([
			path.join(root, "packages/with/src/lib/schemas"),
		]);
		expect(fake.size).toBe(1);
	});

	test("rapid events coalesce into a single regenerate after tick", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/app/package.json", '{"name":"app"}');
		writeFile(
			"packages/app/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const scheduler = createFakeScheduler();
		const fake = createFakeWatcher();
		const summaries: GenerationSummary[] = [];
		watcher = watchWorkspaceTypes(root, {
			createWatcher: fake.createWatcher,
			onSummary: (summary) => summaries.push(summary),
			scheduler,
		});

		expect(summaries).toHaveLength(1); // initial

		const schemasDir = path.join(root, "packages/app/src/lib/schemas");
		fake.emit(schemasDir, "change", "foo.ts");
		fake.emit(schemasDir, "change", "foo.ts");
		fake.emit(schemasDir, "change", "foo.ts");

		expect(scheduler.pending).toBe(1);
		expect(summaries).toHaveLength(1);

		scheduler.tick();

		expect(summaries).toHaveLength(2);
		expect(scheduler.pending).toBe(0);
	});

	test("schema change updates types.ts after debounce tick", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/app/package.json", '{"name":"app"}');
		writeFile(
			"packages/app/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const scheduler = createFakeScheduler();
		const fake = createFakeWatcher();
		watcher = watchWorkspaceTypes(root, {
			createWatcher: fake.createWatcher,
			scheduler,
		});

		const schemasDir = path.join(root, "packages/app/src/lib/schemas");
		const typesPath = "packages/app/src/lib/types.ts";

		expect(read(typesPath)).toContain("FooType");

		writeFile(
			"packages/app/src/lib/schemas/bar.ts",
			'import { z } from "zod";\nexport const BarSchema = z.object({});\n'
		);
		fake.emit(schemasDir, "change", "bar.ts");

		expect(read(typesPath)).not.toContain("BarType");

		scheduler.tick();

		expect(read(typesPath)).toContain("BarType");
	});

	test("close is idempotent and clears pending timer and watchers", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/app/package.json", '{"name":"app"}');
		writeFile(
			"packages/app/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const scheduler = createFakeScheduler();
		const fake = createFakeWatcher();
		watcher = watchWorkspaceTypes(root, {
			createWatcher: fake.createWatcher,
			scheduler,
		});

		const schemasDir = path.join(root, "packages/app/src/lib/schemas");
		fake.emit(schemasDir, "change", "foo.ts");

		expect(scheduler.pending).toBe(1);
		expect(fake.size).toBe(1);

		watcher.close();
		expect(scheduler.pending).toBe(0);
		expect(fake.size).toBe(0);
		expect(watcher.watchers.size).toBe(0);

		// Second close should not throw.
		watcher.close();

		// After close, emit should be ignored and no new timer scheduled.
		fake.emit(schemasDir, "change", "foo.ts");
		expect(scheduler.pending).toBe(0);
		expect(fake.size).toBe(0);
	});

	test("onEvent.workspace is the workspace root", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/app/package.json", '{"name":"app"}');
		writeFile(
			"packages/app/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const scheduler = createFakeScheduler();
		const fake = createFakeWatcher();
		const events: Array<{
			workspace: string;
			eventType: string;
			filename: string | null;
		}> = [];
		watcher = watchWorkspaceTypes(root, {
			createWatcher: fake.createWatcher,
			onEvent: (event) => events.push(event),
			scheduler,
		});

		const schemasDir = path.join(root, "packages/app/src/lib/schemas");
		fake.emit(schemasDir, "change", "foo.ts");

		expect(events).toHaveLength(1);
		expect(events[0]?.workspace).toBe("packages/app");
		expect(events[0]?.eventType).toBe("change");
		expect(events[0]?.filename).toBe("foo.ts");
	});

	test("generation error calls onError and keeps watching", () => {
		writeFile("package.json", JSON.stringify({ workspaces: ["packages/*"] }));
		writeFile("packages/app/package.json", '{"name":"app"}');
		writeFile(
			"packages/app/src/lib/schemas/foo.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const scheduler = createFakeScheduler();
		const fake = createFakeWatcher();
		const errors: unknown[] = [];
		const summaries: GenerationSummary[] = [];
		watcher = watchWorkspaceTypes(root, {
			createWatcher: fake.createWatcher,
			onError: (error) => errors.push(error),
			onSummary: (summary) => summaries.push(summary),
			scheduler,
		});

		expect(summaries).toHaveLength(1);

		// Introduce a duplicate schema that causes generateWorkspaceTypes to throw.
		writeFile(
			"packages/app/src/lib/schemas/foo2.ts",
			'import { z } from "zod";\nexport const FooSchema = z.object({});\n'
		);

		const schemasDir = path.join(root, "packages/app/src/lib/schemas");
		fake.emit(schemasDir, "change", "foo2.ts");
		scheduler.tick();

		expect(errors).toHaveLength(1);
		expect(errors[0]).toBeInstanceOf(Error);
		expect(fake.size).toBe(1);
		expect(watcher.watchers.size).toBe(1);

		// Fix the error.
		rmSync(path.join(root, "packages/app/src/lib/schemas/foo2.ts"));
		fake.emit(schemasDir, "change", "foo2.ts");
		scheduler.tick();

		expect(errors).toHaveLength(1);
		expect(summaries).toHaveLength(2);
	});
});
