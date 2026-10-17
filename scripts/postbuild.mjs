/**
 * Post-build step: copy dist/index.html to dist/404.html.
 *
 * The redirect rules in netlify.toml are deliberately scoped (only the real
 * routes) so that `netlify dev` can still proxy Vite's module URLs — a greedy
 * `/*` rewrite would rewrite `/src/*` requests to index.html and break the dev
 * server. For any other unknown URL in production, Netlify serves 404.html
 * (with a real 404 status, which search engines handle correctly) and React
 * Router boots the app anyway, so visitors still land on a working page.
 */
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const index = join(root, "dist", "index.html");
const notFound = join(root, "dist", "404.html");

if (!existsSync(index)) {
  console.error("[postbuild] dist/index.html not found — run vite build first.");
  process.exit(1);
}
copyFileSync(index, notFound);
console.log("[postbuild] wrote dist/404.html (SPA fallback for unknown URLs)");
