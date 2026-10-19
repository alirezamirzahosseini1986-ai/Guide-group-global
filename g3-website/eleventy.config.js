import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import esbuild from "esbuild";
import { buildSchema } from "./src/lib/schema.js";
import routes from "./src/_data/routes.js";
import site from "./src/_data/site.js";

const WIX = "static.wixstatic.com/media/";

/** Resize Wix-hosted images on the fly; leave other URLs untouched. */
function img(src, w, h) {
  if (!src) return "";
  if (src.includes(WIX) && !src.includes("/v1/")) {
    const name = src.split("/").pop();
    const ext = /\.png$/i.test(name) ? "png" : "jpg";
    return `${src}/v1/fill/w_${Math.round(w)},h_${Math.round(h)},al_c,q_80,usm_0.66_1.00_0.01,enc_auto/img.${ext}`;
  }
  return src;
}

function srcset(src, ratio, widths = [480, 768, 1080, 1440, 1920]) {
  if (!src || !src.includes(WIX) || src.includes("/v1/")) return "";
  return widths.map((w) => `${img(src, w, w / ratio)} ${w}w`).join(", ");
}

const NUM_LOCALE = { fa: "fa-IR", en: "en-GB", ar: "ar-u-nu-latn" };

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin/index.html": "admin/index.html" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  eleventyConfig.addWatchTarget("src/js/");
  eleventyConfig.addWatchTarget("src/content/");

  // Bundle and minify JavaScript (GSAP, Lenis, Three.js are self-hosted, no CDN).
  eleventyConfig.on("eleventy.before", async () => {
    await esbuild.build({
      entryPoints: ["src/js/main.js"],
      bundle: true,
      minify: true,
      format: "esm",
      splitting: true,
      target: "es2020",
      outdir: "_site/assets/js",
      chunkNames: "chunks/[name]-[hash]",
      legalComments: "none",
      logLevel: "warning",
    });
  });

  eleventyConfig.addFilter("img", img);
  eleventyConfig.addFilter("srcset", srcset);
  eleventyConfig.addFilter("abs", (url) => site.url + site.prefix + (url.startsWith("/") ? url : "/" + url));
  eleventyConfig.addFilter("localUrl", (key, lang) => `/${lang}/${routes[key] ?? ""}`);
  eleventyConfig.addFilter("num", (n, lang) =>
    new Intl.NumberFormat(NUM_LOCALE[lang] || "en", { useGrouping: n >= 10000 }).format(n)
  );
  eleventyConfig.addFilter("pad2", (n, lang) =>
    new Intl.NumberFormat(NUM_LOCALE[lang] || "en", { minimumIntegerDigits: 2 }).format(n)
  );
  eleventyConfig.addFilter("schema", (pageKey, ctx) => JSON.stringify(buildSchema({ pageKey, ...ctx })));
  eleventyConfig.addFilter("words", (s) => String(s || "").trim().split(/\s+/));
  eleventyConfig.addFilter("tel", (s) => String(s || "").replace(/[^\d+]/g, ""));
  eleventyConfig.addFilter("nbsp", (s) => String(s || "").replace(/ /g, "\u00a0"));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: site.prefix ? site.prefix + "/" : "/",
    templateFormats: ["njk", "11ty.js"],
    htmlTemplateEngine: "njk",
  };
}
