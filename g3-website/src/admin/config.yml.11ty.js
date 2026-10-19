import { sveltiaConfig } from "../lib/cms.js";

export const data = { permalink: "/admin/config.yml", eleventyExcludeFromCollections: true };

// JSON is valid YAML, so the generated object is written as JSON.
export function render() {
  const repo = process.env.GITHUB_REPOSITORY || "YOUR-GITHUB-USERNAME/YOUR-REPO";
  const branch = process.env.CMS_BRANCH || "main";
  return JSON.stringify(sveltiaConfig({ repo, branch }), null, 2);
}
