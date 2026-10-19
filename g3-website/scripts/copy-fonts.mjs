// Copies self-hosted fonts (no Google servers → GDPR-friendly & faster) into src/assets/fonts
import fs from "node:fs";
const NM = "node_modules/";
const OUT = "src/assets/fonts/";
fs.mkdirSync(OUT, { recursive: true });
const KEEP = /(latin|arabic)-(wght|\d{3})-(normal|italic)\.woff2/;
function faces(pkg, files) {
  let css = "";
  for (const f of files) {
    const src = fs.readFileSync(`${NM}${pkg}/${f}`, "utf8");
    for (const block of src.match(/@font-face\s*{[^}]*}/g) || []) {
      const m = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/);
      if (!m || !KEEP.test(m[1]) || /latin-ext/.test(m[1])) continue;
      fs.copyFileSync(`${NM}${pkg}/files/${m[1]}`, OUT + m[1]);
      css += block.replace(/src:[^;]+;/, `src:url(./${m[1]}) format("woff2");`).replace(/\s+/g, " ") + "\n";
    }
  }
  return css;
}
const vazir = faces("@fontsource-variable/vazirmatn", ["wght.css"]);
const inter = faces("@fontsource-variable/inter", ["wght.css"]);
const corm = faces("@fontsource/cormorant-garamond", ["400.css", "500.css", "600.css", "400-italic.css", "500-italic.css"]);
const kufi = faces("@fontsource-variable/noto-kufi-arabic", ["wght.css"]);
const plex = faces("@fontsource/ibm-plex-sans-arabic", ["300.css", "400.css", "500.css", "600.css"]);
const cinzel = faces("@fontsource/cinzel", ["500.css", "600.css"]);
const fix = (s) => s.replace(/font-family: '([^']+) Variable'/g, "font-family: '$1'");
fs.writeFileSync(OUT + "fa.css", fix(vazir + cinzel));
fs.writeFileSync(OUT + "en.css", fix(inter + corm + cinzel));
fs.writeFileSync(OUT + "ar.css", fix(kufi + plex + cinzel));
fs.writeFileSync(OUT + "all.css", fix(vazir + corm + kufi + cinzel));
console.log(fs.readdirSync(OUT).join("\n"));
