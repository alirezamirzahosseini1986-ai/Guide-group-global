// Builds the admin-panel field definitions automatically from the content JSON,
// so the panel always matches the site structure exactly.
import fs from "node:fs";

const ROOT = new URL("../content/", import.meta.url);

export const PAGES = [
  ["ui", "منو، فوتر و متن‌های عمومی"],
  ["home", "صفحه اصلی"],
  ["immigration", "مهاجرت"],
  ["study", "تحصیل"],
  ["golden", "گلدن ویزا"],
  ["about", "درباره ما"],
  ["consult", "ثبت مشاوره (فرم)"],
  ["privacy", "حریم خصوصی"],
];
export const LANGS = [
  ["fa", "🇮🇷 محتوای فارسی"],
  ["en", "🇬🇧 English content (انگلیسی)"],
  ["ar", "🇸🇦 المحتوى العربي (عربی)"],
];

const LABELS = {
  seo: "سئو (عنوان و توضیح گوگل)", title: "عنوان", description: "توضیحات", text: "متن", text_1: "پاراگراف ۱", text_2: "پاراگراف ۲",
  hero: "بخش بالای صفحه (هیرو)", eyebrow: "متن کوچک بالای عنوان", title_1: "عنوان - خط اول", title_2: "عنوان - خط دوم (طلایی)",
  subtitle: "زیرعنوان", cta: "متن دکمه", cta_primary: "دکمه اصلی", cta_secondary: "دکمه دوم", image: "عکس", image_alt: "توضیح عکس (برای گوگل و نابینایان)",
  video: "ویدیو (لینک یا آپلود MP4)", poster: "عکس پیش‌نمایش ویدیو", kicker: "برچسب کوچک", statement: "جمله بزرگ", stats: "آمار",
  number: "عدد", suffix: "پسوند (مثل +)", label: "برچسب", paths: "مسیرها", items: "موارد", link: "لینک به صفحه", values: "چرا ما",
  spotlight: "بخش گلدن ویزا (کارت سه‌بعدی)", card_title: "متن روی کارت", card_subtitle: "زیرعنوان کارت", specs: "مشخصات", value: "مقدار",
  advantages: "مزایا", global: "بخش کره زمین", pass_title: "عنوان کارت مسیر", quiz: "دانستنی‌ها", closing: "جمله پایانی", faq: "پرسش‌های پرتکرار",
  q: "پرسش", a: "پاسخ", updated: "تاریخ بازبینی حقوقی", options: "گزینه‌های سرمایه‌گذاری", amount: "مبلغ", benefits: "امتیازات",
  opportunity: "فرصت", story: "داستان ما", vision: "چشم‌انداز", promise: "تعهد", pillars: "ارزش‌ها", business: "کسب‌وکار",
  realestate: "املاک", steps: "مراحل", future: "آینده", highlights: "نکات کلیدی", diploma: "دیپلم", universities: "دانشگاه‌ها",
  abbr: "نام کوتاه", name: "نام", form: "فرم", sections: "بخش‌ها", nav: "منو", footer: "فوتر", cta_band: "بنر دعوت به مشاوره",
  not_found: "صفحه ۴۰۴", purposes: "گزینه‌های هدف", offices: "گزینه‌های نوع مشاوره", brand: "برند", logo: "لوگو", contact: "اطلاعات تماس",
  social: "شبکه‌های اجتماعی", company: "اطلاعات شرکت", site_url: "آدرس سایت", founded: "سال تأسیس", default_lang: "زبان پیش‌فرض",
  email: "ایمیل", whatsapp: "واتس‌اپ (فقط عدد با کد کشور)", map_url: "لینک نقشه گوگل", og_image: "عکس اشتراک‌گذاری (شبکه‌های اجتماعی)",
  google_verification: "کد تأیید Google Search Console", bing_verification: "کد تأیید Bing", ga4_id: "شناسه Google Analytics (G-XXXX)",
};

const IMAGE_KEYS = new Set(["image", "poster", "logo", "og_image"]);
const FILE_KEYS = new Set(["video"]);

function label(key) {
  return LABELS[key] || key.replace(/_/g, " ");
}

function field(key, value) {
  const base = { name: key, label: label(key), required: false };
  if (IMAGE_KEYS.has(key)) return { ...base, widget: "image" };
  if (FILE_KEYS.has(key)) return { ...base, widget: "file" };
  if (key === "link") return { ...base, widget: "select", options: ["home", "immigration", "study", "golden", "about", "consult"] };
  if (typeof value === "number") return { ...base, widget: "number", value_type: "int" };
  if (typeof value === "boolean") return { ...base, widget: "boolean" };
  if (typeof value === "string") return { ...base, widget: value.length > 90 || key === "text" ? "text" : "string" };
  if (Array.isArray(value)) {
    if (typeof value[0] === "object") {
      const fields = Object.entries(value[0]).map(([k, v]) => field(k, v));
      const sumKey = ["title", "q", "label", "name", "text"].find((k) => k in value[0]);
      return { ...base, widget: "list", collapsed: true, summary: sumKey ? `{{fields.${sumKey}}}` : undefined, fields };
    }
    return { ...base, widget: "list", field: { name: "item", label: "مورد", widget: "string" } };
  }
  if (value && typeof value === "object") {
    return { ...base, widget: "object", collapsed: true, fields: Object.entries(value).map(([k, v]) => field(k, v)) };
  }
  return { ...base, widget: "string" };
}

const read = (p) => JSON.parse(fs.readFileSync(new URL(p, ROOT)));

/** Sveltia / Decap CMS config (served at /admin/config.yml). */
export function sveltiaConfig({ repo, branch }) {
  const settings = read("site.json");
  return {
    backend: { name: "github", repo, branch },
    media_folder: "src/assets/uploads",
    public_folder: "/assets/uploads",
    site_url: undefined,
    collections: [
      {
        name: "settings",
        label: "⚙️ تنظیمات عمومی سایت",
        files: [{ name: "site", label: "تنظیمات، تماس، شرکت و سئو", file: "src/content/site.json", format: "json", fields: Object.entries(settings).map(([k, v]) => field(k, v)) }],
      },
      ...LANGS.map(([lang, langLabel]) => ({
        name: `content_${lang}`,
        label: langLabel,
        files: PAGES.map(([page, pageLabel]) => ({
          name: `${lang}_${page}`,
          label: pageLabel,
          file: `src/content/${lang}/${page}.json`,
          format: "json",
          fields: Object.entries(read(`fa/${page}.json`)).map(([k, v]) => field(k, v)),
        })),
      })),
    ],
  };
}

/** Pages CMS config (.pages.yml at the repo root) — alternative panel at app.pagescms.org */
function pagesField(key, value) {
  const base = { name: key, label: label(key) };
  if (IMAGE_KEYS.has(key)) return { ...base, type: "image" };
  if (FILE_KEYS.has(key)) return { ...base, type: "file" };
  if (typeof value === "number") return { ...base, type: "number" };
  if (typeof value === "boolean") return { ...base, type: "boolean" };
  if (typeof value === "string") return { ...base, type: value.length > 90 || key === "text" ? "text" : "string" };
  if (Array.isArray(value)) {
    if (typeof value[0] === "object") return { ...base, type: "object", list: true, fields: Object.entries(value[0]).map(([k, v]) => pagesField(k, v)) };
    return { ...base, type: "string", list: true };
  }
  if (value && typeof value === "object") return { ...base, type: "object", fields: Object.entries(value).map(([k, v]) => pagesField(k, v)) };
  return { ...base, type: "string" };
}

export function pagesCmsConfig() {
  const settings = read("site.json");
  const content = [
    { name: "settings", label: "⚙️ تنظیمات عمومی سایت", type: "file", path: "src/content/site.json", format: "json", fields: Object.entries(settings).map(([k, v]) => pagesField(k, v)) },
  ];
  for (const [lang, langLabel] of LANGS) {
    for (const [page, pageLabel] of PAGES) {
      content.push({
        name: `${lang}_${page}`,
        label: `${langLabel.split(" ")[0]} ${pageLabel} (${lang.toUpperCase()})`,
        type: "file",
        path: `src/content/${lang}/${page}.json`,
        format: "json",
        fields: Object.entries(read(`fa/${page}.json`)).map(([k, v]) => pagesField(k, v)),
      });
    }
  }
  return { media: { input: "src/assets/uploads", output: "/assets/uploads" }, content };
}
