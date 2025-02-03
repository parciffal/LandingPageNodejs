const { performance } = require("perf_hooks");
const { crawlDomain } = require("./utils/crawler");
const { extractSitemapUrls } = require("./utils/sitemap");
const { filterUrls } = require("./utils/filter");
const { saveOutput } = require("./utils/output");
const { initializeConstants } = require("./tools/constant");
const { Checkers } = require("./tools/checkers");

const startCrawler = async (domain) => {
  const startTime = performance.now(); // Record start time
  try {
    const constants = await initializeConstants();
    const checker = new Checkers(constants);
    const urlHtmlMap = new Map(); // Map to store URL and its corresponding HTML content

    // Concurrently crawl domain and extract sitemap URLs
    const [crawlerOutput, sitemapUrls] = await Promise.all([
      crawlDomain(domain, 2, checker, urlHtmlMap),
      extractSitemapUrls(domain, checker),
    ]);

    const crawledUrls = crawlerOutput.crawledUrls;

    // Combine and deduplicate URLs
    const uniqueUrls = new Set([...crawledUrls, ...sitemapUrls]);

    // Clean URLs using the checker
    const cleanedUrls = Array.from(uniqueUrls).map((url) =>
      checker.cleanURL(url)
    );

    // Filter the cleaned URLs
    const filteredUrls = filterUrls(cleanedUrls, checker, domain);

    

    // Save the filtered output
    await saveOutput({ dataset1: filteredUrls });

    // Log runtime statistics
    const totalTime = (performance.now() - startTime).toFixed(2);
    console.log(`Crawling process completed in ${totalTime} ms`);
    console.log(`Total unique URLs: ${cleanedUrls.length}`);
    console.log(`Filtered URLs: ${filteredUrls.length}`);
  } catch (error) {
    console.error("Error during crawling:", error);
  }
};

startCrawler("https://customshow.com");
