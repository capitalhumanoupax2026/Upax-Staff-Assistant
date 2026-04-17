import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const root = path.dirname(fileURLToPath(import.meta.url));

await esbuild({
  entryPoints: [path.resolve(root, "artifacts/api-server/src/app.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(root, "api/_app.cjs"),
  logLevel: "info",
  external: [
    "*.node", "pg-native", "pino", "pino-http", "pino-pretty",
    "sharp", "better-sqlite3", "canvas", "bcrypt", "argon2",
    "fsevents", "re2", "bufferutil", "utf-8-validate",
    "dtrace-provider", "thread-stream", "googleapis",
  ],
  sourcemap: false,
});

console.log("✅ API bundle built → api/_app.cjs");
