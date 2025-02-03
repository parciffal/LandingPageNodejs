const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const { initializeConstants } = require("./constant"); // Import constants

/**
 * Utility class for URL and text processing.
 */
class Checkers {
  constructor(constants) {
    if (!constants) {
      throw new Error("Constants must be initialized");
    }
    this.constants = constants;
  }

  /**
   * Check if a word is in the ignore words list.
   * @param {string} word - The word to check.
   * @returns {boolean} - True if the word is not ignored.
   */
  checkIgnoreWords(word = "") {
    return !this.constants.IGNORE_WORDS.includes(word);
  }

  /**
   * Check if a URL contains ignored keys or ends with excluded patterns.
   * @param {string} url - The URL to check.
   * @returns {boolean} - True if the URL passes the check.
   */
  checkIgnoreKeys(url = "") {
    if (!url) return false;

    url = url.toLowerCase();
    return (
      !this.constants.EXCLUDE_LANDING.some((key) => url.includes(key)) &&
      !this.constants.ENDS_WITH.some((pattern) => url.endsWith(pattern))
    );
  }

  /**
   * Check if a URL contains blog-related patterns.
   * @param {string} url - The URL to check.
   * @returns {boolean} - True if the URL matches blog-related patterns.
   */
  checkBlog(url = "") {
    url = url.toLowerCase();
    return (
      (this.constants.BlogUrlPostfixes.some((postfix) =>
        url.includes(postfix)
      ) ||
        this.constants.BlogUrlPrefixes.some((prefix) =>
          url.startsWith(prefix)
        )) &&
      !this.constants.EXCLUDE_BLOG.some((word) => url.includes(word)) &&
      !this.constants.ENDS_WITH.some((pattern) => url.endsWith(pattern))
    );
  }

  /**
   * Clean text by removing symbols, numbers, emojis, and extra spaces.
   * @param {string} text - The text to clean.
   * @returns {string} - Cleaned text.
   */
  cleanText(text = "") {
    const cleanSymbols = (char) =>
      this.constants.IGNORE_SYMBOLS.includes(char) ? " " : char;
    return text
      .toLowerCase()
      .split("")
      .map(cleanSymbols)
      .join("")
      .replace(/[\u{1F600}-\u{1F77F}]|[\u{2600}-\u{27BF}]/gu, "") // Remove emojis
      .replace(/[0-9]/g, "") // Remove numbers
      .replace(/[\r\n\t\v\f]+/g, " ") // Remove line breaks
      .replace(/\s+/g, " ") // Replace multiple spaces
      .trim();
  }

  /**
   * Generate keywords from text.
   * @param {string} text - The text to process.
   * @returns {string} - Generated keywords.
   */
  generateKeywordFromText(text = "") {
    return this.cleanText(text).split(" ").filter(Boolean).join(" ");
  }

  /**
   * Generate keywords from a URL.
   * @param {string} url - The URL to process.
   * @returns {string} - Generated keywords.
   */
  generateKeywordFromURL(url = "") {
    const lastPart = url.toLowerCase().split("/").pop();
    return this.generateKeywordFromText(
      lastPart.replace(/[-.](html|php|xml)$/g, "").replace(/-/g, " ")
    );
  }

  /**
   * Clean and normalize a URL.
   * @param {string} url - The URL to clean.
   * @returns {string} - Cleaned URL.
   */
  cleanURL(url = "") {
    return url
      .toLowerCase()
      .trim()
      .replace(/[\r\n\t ]+/g, "") // Remove spaces and line breaks
      .replace(/\/+$/, "") // Remove trailing slashes
      .split(/[?#]/)[0]; // Remove query parameters and fragments
  }

  /**
   * Check if a URL is a landing page based on exclusions.
   * @param {string} url - The URL to check.
   * @returns {boolean} - True if the URL is a valid landing page.
   */
  checkLandingPage(url = "") {
    url = url.toLowerCase();
    return (
      !this.constants.ENDS_WITH.some((pattern) => url.endsWith(pattern)) &&
      !this.constants.EXCLUDE_LANDING.some((key) => url.includes(key))
    );
  }

  checkExcludeFull(url = "", domain) {
    url = url.toLowerCase();
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    const slash_count = (url.match(/\//g) || []).length;
    // console.log(url, slash_count);
    return (
      this.constants.EXCLUDE_FULL.some((key) => url.includes(key)) ||
      url.endsWith(domain) ||
      slash_count < 3
    );
  }

  /**
   * Check if a URL contains service-related keywords.
   * @param {string} url - The URL to check.
   * @returns {boolean} - True if the URL contains service-related keywords.
   */
  checkContainService(url = "") {
    url = url.toLowerCase();
    return this.constants.CONTAINS_WORDS.some((pattern) =>
      url.includes(pattern)
    );
  }

  /**
   * Check if a keyword matches or contains a predefined keyword.
   * @param {string} keyword - The keyword to check.
   * @returns {string} - "True" if matches, "Contain" if partially matches, otherwise "False".
   */
  keywordChecker(keyword = "") {
    if (!keyword) return "False";

    for (const word of this.constants.KEYWORDS) {
      if (keyword === word) return "True";
      if (keyword.includes(word)) return "Contain";
    }
    return "False";
  }
}

module.exports = { Checkers };
