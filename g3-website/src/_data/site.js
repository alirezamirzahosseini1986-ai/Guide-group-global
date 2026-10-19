import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync(new URL("../content/site.json", import.meta.url)));

// On GitHub Pages the deploy workflow passes the real address and sub-path,
// so the site works both on username.github.io/repo/ and on a custom domain.
const url = (process.env.SITE_URL || raw.site_url || "").replace(/\/+$/, "").replace(/^(https?:\/\/[^/]+).*$/, "$1");
const fromEnvPath = (process.env.SITE_URL || "").replace(/^https?:\/\/[^/]+/, "");
const prefix = (process.env.PATH_PREFIX ?? fromEnvPath ?? "").replace(/\/+$/, "");

export default { ...raw, url, prefix, year: new Date().getFullYear() };
