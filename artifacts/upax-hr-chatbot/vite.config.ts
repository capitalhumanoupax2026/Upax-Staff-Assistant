import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isBuildMode = process.argv.includes("build") || process.env.NODE_ENV === "production";

// PORT only required when serving (not during build)
const port = (() => {
  if (isBuildMode) return 3000;
  const rawPort = process.env.PORT;
  if (!rawPort) throw new Error("PORT environment variable is required");
  const p = Number(rawPort);
  if (Number.isNaN(p) || p <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);
  return p;
})();

// BASE_PATH defaults to "/" for Vercel production
const basePath = process.env.BASE_PATH || "/";

const replitPlugins =
  !isBuildMode && process.env.REPL_ID !== undefined
    ? [
        await import("@replit/vite-plugin-runtime-error-modal").then((m) => m.default()),
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer({ root: path.resolve(import.meta.dirname, "..") })
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
      ]
    : [];

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss(), ...replitPlugins],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true, deny: ["**/.*"] },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
