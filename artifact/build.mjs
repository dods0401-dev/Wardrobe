// Builds a single self-contained HTML file of the app (for claude.ai Artifact hosting).
// Usage: node artifact/build.mjs <out.html>
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = process.argv[2] ?? path.join(root, "artifact", "wardrobe.html");
const tmp = path.join(root, "artifact/.build");
mkdirSync(tmp, { recursive: true });

// CSS: Tailwind over the app sources; fonts come from Google Fonts instead of local files.
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8").replace(/@import "@fontsource[^"]*";\n/g, "");
writeFileSync(path.join(tmp, "in.css"), `${css}\n@source "${root}/src";\n`);
execSync(`npx @tailwindcss/cli -i ${tmp}/in.css -o ${tmp}/out.css --minify`, { cwd: root, stdio: "pipe" });

const shim = path.join(root, "artifact/router.tsx");
const result = await build({
  entryPoints: [path.join(root, "artifact/entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "@": path.join(root, "src"), "next/link": shim, "next/navigation": shim },
  logLevel: "warning",
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const html = `<title>Project Wardrobe</title>
<meta name="description" content="Interactive prototype of a digital wardrobe and personal stylist.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=Inter:wght@400..700&display=swap">
<style>:root{--font-display:"DM Sans",ui-sans-serif,system-ui,sans-serif;--font-sans:"Inter",ui-sans-serif,system-ui,sans-serif;color-scheme:light}
${readFileSync(path.join(tmp, "out.css"), "utf8")}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
