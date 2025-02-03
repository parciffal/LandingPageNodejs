const filterUrls = (urls, checker, domain) => {
  // Categorize URLs into blog and landing page types
  const categorizedUrls = urls.map((url) => {
    if (url.endsWith(domain)) {
      return null;
    } else if (checker.checkLandingPage(url)) {
      return { link: url, type: "landing_page" };
    } else if (checker.checkBlog(url)) {
      return { link: url, type: "blog" };
    }
    return null; // Exclude URLs that don't match any category
  });

  // Filter out null values and remove duplicates (prioritizing landing pages)
  const uniqueUrls = new Map();
  categorizedUrls
    .filter(Boolean) // Remove null entries
    .forEach(({ link, type }) => {
      // Prioritize landing_page type if duplicates exist
      if (!uniqueUrls.has(link) || type === "landing_page") {
        uniqueUrls.set(link, { link, type });
      }
    });

  return Array.from(uniqueUrls.values());
};

const filterBlogUrls = (urls, checker) => {
  // Filter based on the blog checker method
  return urls.filter((url) => checker.checkBlog(url));
};

const filterLandingPageUrls = (urls, checker) => {
  // Filter based on the landing page checker method
  return urls.filter((url) => checker.checkLandingPage(url));
};

module.exports = { filterUrls, filterBlogUrls, filterLandingPageUrls };
