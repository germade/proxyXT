import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await build({
  entryPoints: [path.join(srcDir, "popup.js")],
  outfile: path.join(distDir, "popup.js"),
  bundle: true,
  format: "esm",
  target: "es2020",
  jsxFactory: "h",
  jsxFragment: "Fragment",
  loader: {
    ".js": "js",
    ".jsx": "jsx"
  }
});

const staticFiles = [
  "popup.html",
  "popup.css",
  "background.js",
  "manifest.json",
  "proxyxt.png",
  "proxyxt-off.png"
];

for (const fileName of staticFiles) {
  await cp(path.join(srcDir, fileName), path.join(distDir, fileName));
}

await cp(path.join(srcDir, "icons"), path.join(distDir, "icons"), { recursive: true });
