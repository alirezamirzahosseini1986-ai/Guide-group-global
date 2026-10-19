// Automated quality check of the built site (_site): SEO, RTL/LTR, links, a11y basics.
// Usage: npm run build && npm run check
import fs from "node:fs";
import path from "node:path";

const OUT = "_site";
const PREFIX = (process.env.PATH_PREFIX || "").replace(/\/$/, "");
const LANGS = { fa: "rtl", en: "ltr", ar: "rtl" };
let errors = 0, warnings = 0, pages = 0;
const err = (f, m) => { errors++; console.error(`✗ ${f}: ${m}`); };
const warn = (f, m) => { warnings++; console.warn(`! ${f}: ${m}`); };

const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p); } })(OUT);

const exists = (url) => {
  let u = url.split("#")[0].split("?")[0];
  if (PREFIX && u.startsWith(PREFIX)) u = u.slice(PREFIX.length);
  const p = path.join(OUT, decodeURIComponent(u));
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, "index.html")));
};
const titles = new Map(), descs = new Map();

for (const file of files) {
  const rel = file.slice(OUT.length);
  const html = fs.readFileSync(file, "utf8");
  if (/\/admin\//.test(rel)) continue;
  pages++;
  const m = rel.match(/^\/(fa|en|ar)\//);
  const lang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1];
  const dir = html.match(/<html[^>]*\bdir="([^"]+)"/)?.[1];
  if (m) {
    if (lang !== m[1]) err(rel, `lang="${lang}" should be "${m[1]}"`);
    if (dir !== LANGS[m[1]]) err(rel, `dir="${dir}" should be "${LANGS[m[1]]}"`);
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || "";
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
    if (!title) err(rel, "missing <title>");
    if (title.length > 70) warn(rel, `title is ${title.length} chars (Google shows ~60-70)`);
    if (desc.length < 70 || desc.length > 170) warn(rel, `meta description is ${desc.length} chars (aim 70-170)`);
    if (titles.has(title)) err(rel, `duplicate title with ${titles.get(title)}`); titles.set(title, rel);
    if (descs.has(desc)) err(rel, `duplicate description with ${descs.get(desc)}`); descs.set(desc, rel);
    if (!/<link rel="canonical" href="https?:\/\//.test(html)) err(rel, "missing absolute canonical");
    const hl = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    const codes = hl.map((h) => h[1]).sort().join(",");
    if (codes !== "ar,en,fa,x-default") err(rel, `hreflang set is "${codes}"`);
    for (const [, , href] of hl) if (!exists(new URL(href).pathname)) err(rel, `hreflang target missing: ${href}`);
    for (const p of ["og:title", "og:description", "og:image", "og:url", "og:locale", "twitter:card"])
      if (!html.includes(`"${p}"`)) err(rel, `missing ${p}`);
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) err(rel, `${h1} <h1> elements (need exactly 1)`);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!ld.length) err(rel, "missing JSON-LD");
    for (const [, j] of ld) { try { JSON.parse(j); } catch (e) { err(rel, "invalid JSON-LD: " + e.message); } }
  }
  for (const [, tag] of html.matchAll(/(<img\b[^>]*>)/g)) if (!/\balt="/.test(tag)) err(rel, `img without alt: ${tag.slice(0, 80)}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) err(rel, `duplicate ids: ${[...new Set(dup)].join(", ")}`);
  for (const [, href] of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) if (!exists(href)) err(rel, `broken internal link: ${href}`);
  if (/googleapis|fonts\.gstatic/.test(html)) err(rel, "loads Google Fonts (GDPR) — fonts must be self-hosted");
  // Latin drop-cap or letter-spacing must not touch Persian/Arabic text
}
for (const f of ["sitemap.xml", "robots.txt", "404.html", "site.webmanifest", "admin/config.yml", "admin/index.html", "assets/js/main.js", "assets/css/main.css"])
  if (!fs.existsSync(path.join(OUT, f))) err(f, "missing file");
const sm = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
const locs = (sm.match(/<loc>/g) || []).length;
if (locs !== 21) err("sitemap.xml", `${locs} URLs, expected 21 (7 pages × 3 languages)`);
try { JSON.parse(fs.readFileSync(path.join(OUT, "admin/config.yml"), "utf8")); } catch { err("admin/config.yml", "invalid"); }

console.log(`\nChecked ${pages} pages: ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
