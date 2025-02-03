const axios = require("axios");

/**
 * Extracts all URLs from sitemaps recursively.
 * @param {string} domain - The domain to fetch the robots.txt from (e.g., https://example.com).
 * @param {object} checker - Checker instance for cleaning and validating URLs.
 * @returns {Promise<string[]>} - A promise that resolves to an array of all collected URLs.
 */
const extractSitemapUrls = async (domain, checker) => {
  try {
    const robotsUrl = `${domain}/robots.txt`;
    const { data: robotsTxt } = await axios.get(robotsUrl, { timeout: 5000 });

    // Extract sitemap URLs from robots.txt
    const sitemapUrls = robotsTxt
      .split("\n")
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.startsWith("sitemap:"))
      .map((line) => line.replace("sitemap:", "").trim());

    console.log(`Found ${sitemapUrls.length} sitemap URLs in robots.txt.`);

    // Recursively process sitemap URLs and collect non-sitemap URLs
    const collectedUrls = await processSitemaps(sitemapUrls, checker, domain);

    console.log(`Total URLs extracted: ${collectedUrls.length}`);

    return collectedUrls;
  } catch (error) {
    console.error(
      `Failed to extract sitemap URLs from ${domain}: ${error.message}`
    );
    return [];
  }
};

/**
 * Processes sitemap URLs recursively to extract all valid URLs.
 * @param {string[]} sitemapUrls - An array of sitemap URLs to process.
 * @param {object} checker - Checker instance for cleaning and validating URLs.
 * @param {Set<string>} visitedSitemaps - A set to track visited sitemap URLs.
 * @returns {Promise<string[]>} - A promise that resolves to an array of all collected URLs.
 */
const processSitemaps = async (
  sitemapUrls,
  checker,
  domain,
  visitedSitemaps = new Set()
) => {
  const collectedUrls = new Set();

  for (const sitemapUrl of sitemapUrls) {
    if (visitedSitemaps.has(sitemapUrl)) {
      console.log(`Skipping already processed sitemap: ${sitemapUrl}`);
      continue;
    }
    visitedSitemaps.add(sitemapUrl);

    try {
      const { data: xmlContent } = await axios.get(sitemapUrl, {
        timeout: 5000,
      });

      // Extract <loc> tags from the XML content
      const locTags = xmlContent.match(/<loc>(.*?)<\/loc>/g) || [];
      const urls = locTags.map((tag) => tag.replace(/<\/?loc>/g, "").trim());

      // Separate nested sitemaps and regular URLs
      const newSitemapUrls = [];
      for (let url of urls) {
        if (url.endsWith(".xml")) {
          newSitemapUrls.push(url); // Nested sitemap
        } else {
          url = checker.cleanURL(url);
          if (url && url !== domain && !checker.checkExcludeFull(url, domain))
            collectedUrls.add(url); // Valid URL
        }
      }

      // Recursively process nested sitemaps
      const nestedUrls = await processSitemaps(
        newSitemapUrls,
        checker,
        visitedSitemaps
      );
      nestedUrls.forEach((url) => collectedUrls.add(url));
    } catch (error) {
      console.error(
        `Failed to process sitemap ${sitemapUrl}: ${error.message}`
      );
    }
  }

  return Array.from(collectedUrls);
};

module.exports = { extractSitemapUrls };
