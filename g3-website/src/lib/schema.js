// Builds the JSON-LD structured data (schema.org) graph for every page.
import routes from "../_data/routes.js";

const SERVICE_PAGES = { immigration: true, study: true, golden: true };

export function buildSchema({ pageKey, lang, i18n, site }) {
  const L = lang.code;
  const d = i18n[L][pageKey] || {};
  const ui = i18n[L].ui;
  const base = site.url + site.prefix;
  const pageUrl = `${base}/${L}/${routes[pageKey] ?? ""}`;
  const homeUrl = `${base}/${L}/`;
  const orgId = `${base}/#organization`;
  const c = site.contact;

  const sameAs = Object.values(site.social).filter(Boolean);
  const graph = [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": orgId,
      name: site.brand.name,
      alternateName: [site.brand.short, site.brand.legacy_name].filter(Boolean),
      url: `${base}/`,
      logo: site.brand.logo || `${base}/assets/img/logo.png`,
      image: site.seo.og_image,
      email: c.email,
      telephone: c.phone_1,
      foundingDate: site.founded,
      priceRange: "€€",
      address: {
        "@type": "PostalAddress",
        streetAddress: c.address_street,
        postalCode: c.address_postcode,
        addressLocality: c.address_city,
        addressCountry: c.address_country,
      },
      areaServed: ["IR", "AE", "IQ", "SA", "TR", "AF", "QA", "KW", "OM", "BH", "EU"],
      knowsLanguage: ["fa", "en", "ar", "hu"],
      contactPoint: [
        { "@type": "ContactPoint", telephone: c.phone_1, contactType: "customer service", availableLanguage: ["Persian", "English", "Arabic"] },
        { "@type": "ContactPoint", telephone: c.phone_2, contactType: "customer service" },
      ],
      parentOrganization: {
        "@type": "Organization",
        name: site.company.legal_name,
        identifier: site.company.registration_number,
        taxID: site.company.tax_number,
      },
      sameAs,
    },
    {
      "@type": "WebSite",
      "@id": `${base}/#website`,
      url: `${base}/`,
      name: site.brand.name,
      publisher: { "@id": orgId },
      inLanguage: ["fa", "en", "ar"],
    },
    {
      "@type": pageKey === "about" ? "AboutPage" : pageKey === "consult" ? "ContactPage" : "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: d.seo?.title,
      description: d.seo?.description,
      inLanguage: L,
      isPartOf: { "@id": `${base}/#website` },
      about: { "@id": orgId },
      ...(pageKey !== "home" && { breadcrumb: { "@id": `${pageUrl}#breadcrumb` } }),
    },
  ];

  if (pageKey !== "home") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: ui.nav.home, item: homeUrl },
        { "@type": "ListItem", position: 2, name: ui.nav[pageKey], item: pageUrl },
      ],
    });
  }

  if (SERVICE_PAGES[pageKey]) {
    graph.push({
      "@type": "Service",
      "@id": `${pageUrl}#service`,
      name: d.hero?.title,
      description: d.seo?.description,
      serviceType: ui.nav[pageKey],
      provider: { "@id": orgId },
      areaServed: { "@type": "Country", name: "Hungary" },
      inLanguage: L,
    });
  }

  if (pageKey === "golden" && d.faq?.items?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      inLanguage: L,
      mainEntity: d.faq.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (pageKey === "study" && d.universities?.items?.length) {
    graph.push({
      "@type": "ItemList",
      name: d.universities.title,
      itemListElement: d.universities.items.map((u, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "CollegeOrUniversity", name: u.name, alternateName: u.abbr, address: { "@type": "PostalAddress", addressLocality: "Budapest", addressCountry: "HU" } },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
