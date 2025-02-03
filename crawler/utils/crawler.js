const cheerio = require("cheerio");
const { URL } = require("url");
const { makeRequest } = require("../tools/requester");

/**
 * Crawl a domain to extract URLs up to a specified depth.
 * @param {string} domain - The starting domain to crawl.
 * @param {number} maxDepth - Maximum depth to crawl.
 * @param {object} checker - Checker instance for URL validation and cleaning.
 * @param {Map} urlHtmlMap - Map to store crawled URLs and their HTML content.
 * @returns {Promise<object>} - An object containing crawled URLs and the HTML map.
 */
const crawlDomain = async (domain, maxDepth, checker, urlHtmlMap) => {
  if (!checker) {
    throw new Error("Checker is required for URL validation and cleaning.");
  }

  const crawledUrls = new Set();
  const base = new URL(domain).origin;

  /**
   * Recursive function to crawl URLs.
   * @param {string} url - The URL to crawl.
   * @param {number} currentDepth - Current depth of the crawl.
   */
  const crawl = async (url, currentDepth) => {
    if (currentDepth > maxDepth || crawledUrls.has(url)) return;

    if (url !== base || url !== domain) {
      crawledUrls.add(url);
    }

    const response = await makeRequest(url);
    if (!response) {
      console.warn(`Skipping ${url} due to failed request.`);
      return;
    }

    const htmlContent = response;
    urlHtmlMap.set(checker.cleanURL(url), htmlContent);

    const fetchedUrls = await fetchUrlsFromPage(
      url,
      htmlContent,
      base,
      checker
    );
    const filteredUrls = fetchedUrls.filter(
      (link) => !crawledUrls.has(link) && link
    );

    await Promise.all(
      filteredUrls.map((link) => crawl(link, currentDepth + 1))
    );
  };

  // Start crawling from the root domain
  await crawl(domain, 0);

  console.log(`Crawled ${crawledUrls.size} unique URLs.`);
  console.log(`Stored ${urlHtmlMap.size} HTML pages.`);
  return { crawledUrls: Array.from(crawledUrls), htmlMap: urlHtmlMap };
};

/**
 * Extract URLs from a page's HTML content.
 * @param {string} url - The current page URL.
 * @param {string} htmlContent - HTML content of the page.
 * @param {string} base - Base URL for resolving relative links.
 * @param {object} checker - Checker instance for URL validation and cleaning.
 * @returns {Promise<string[]>} - An array of valid and cleaned URLs.
 */
const fetchUrlsFromPage = async (url, htmlContent, base, checker) => {
  const $ = cheerio.load(htmlContent);
  const results = new Set();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    try {
      let link = new URL(href, base).toString();
      link = checker.cleanURL(link);

      if (link.startsWith(base) && !checker.checkExcludeFull(link, base)) {
        results.add(link);
      }
    } catch (err) {
      console.warn(`Invalid URL encountered: ${href} on page ${url}`);
    }
  });

  return Array.from(results);
};

module.exports = { crawlDomain };
