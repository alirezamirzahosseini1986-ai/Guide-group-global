import fs from "node:fs";

const base = new URL("../content/", import.meta.url);
const data = {};
for (const lang of ["fa", "en", "ar"]) {
  data[lang] = {};
  const dir = new URL(`${lang}/`, base);
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".json")) {
      data[lang][file.replace(/\.json$/, "")] = JSON.parse(fs.readFileSync(new URL(file, dir)));
    }
  }
}
export default data;
