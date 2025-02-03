const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser"); // To parse CSV files

// IGNORE_SYMBOLS as an array of characters
const IGNORE_SYMBOLS_RUNE = [
  "=",
  "+",
  ",",
  ":",
  ".",
  "!",
  "?",
  '"',
  "'",
  "-",
  ")",
  "(",
  "*",
  "%",
  "$",
  "#",
  "@",
  "`",
  "^",
  "&",
  "}",
  "{",
  "]",
  "[",
  "\\",
  "|",
  "/",
  ">",
  "<",
  "~",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
];

// IGNORE_SYMBOLS as an array of strings
const IGNORE_SYMBOLS = [
  "=",
  "+",
  ",",
  ":",
  ".",
  "!",
  "?",
  "'",
  "-",
  ")",
  "(",
  "*",
  "%",
  "$",
  "#",
  "@",
  "`",
  "^",
  "&",
  "}",
  "{",
  "]",
  "[",
  "\\",
  "|",
  "/",
  ">",
  "<",
  "~",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
];

// Blog URL postfixes
const BlogUrlPostfixes = [
  "/blog",
  "/blogs",
  "/articles",
  "/article",
  "/posts",
  "/post",
  "/resources",
  "/resource",
  "/categorys",
  "/category/blog",
  "/categorys/blog",
  "/category/articles",
  "/category/article",
  "/category/post",
  "/category/news",
  "/source/articles",
  "/source/article",
  "/news",
  "/stories",
  "/thoughts",
  "/journal",
  "/insights",
];

// Blog URL prefixes
const BlogUrlPrefixes = [
  "blog.",
  "blogs.",
  "articles.",
  "article.",
  "posts.",
  "post.",
  "resources.",
  "resource.",
  "categorys.",
  "category.",
  "source.",
  "news.",
  "stories.",
  "thoughts.",
  "journal.",
];

// Contains words
const CONTAINS_WORDS = [
  "/service/",
  "/feature/",
  "/solution/",
  "/tool/",
  "/platform/",
  "/product/",
  "/software/",
  "/services/",
  "/features/",
  "/solutions/",
  "/tools/",
  "/platforms/",
  "/products/",
  "/softwares/",
];

/**
 * Function to read exclusion words from a CSV file.
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<string[]>} - A promise that resolves to an array of words.
 */
const readExclusionWords = (filePath) => {
  return new Promise((resolve, reject) => {
    const exclusionWords = [];
    fs.createReadStream(filePath)
      .pipe(csvParser()) // Parse CSV rows
      .on("data", (row) => {
        const word = Object.values(row)[0]; // Assuming the word is in the first column
        if (word) exclusionWords.push(word);
      })
      .on("end", () => resolve(exclusionWords))
      .on("error", (err) => reject(err));
  });
};

/**
 * Load exclusion words from multiple files and store them in variables.
 */
const initializeConstants = async () => {
  try {
    const IGNORE_WORDS = await readExclusionWords(
      path.resolve("data/const/ignore_words.csv")
    );

    // console.log(IGNORE_KEYS);
    const KEYWORDS = await readExclusionWords(
      path.resolve("data/const/keywords.csv")
    );

    // console.log(IGNORE_WORDS);
    const EXCLUDE_LANDING = await readExclusionWords(
      path.resolve("data/const/excluded_landing.csv")
    );

    // console.log(KEYWORDS);
    const ENDS_WITH = await readExclusionWords(
      path.resolve("data/const/endswith.csv")
    );
    // console.log(ENDS_WITH);
    const EXCLUDE_BLOG = await readExclusionWords(
      path.resolve("data/const/excluded_blog.csv")
    );
    // console.log(EXCLUDE_BLOG);
    const EXCLUDE_FULL = await readExclusionWords(
      path.resolve("data/const/excluded_blog.csv")
    );
    // Return the constants as an object
    return {
      IGNORE_SYMBOLS_RUNE,
      IGNORE_SYMBOLS,
      BlogUrlPostfixes,
      BlogUrlPrefixes,
      CONTAINS_WORDS,
      IGNORE_WORDS,
      EXCLUDE_LANDING,
      KEYWORDS,
      ENDS_WITH,
      EXCLUDE_BLOG,
      EXCLUDE_FULL,
    };
  } catch (err) {
    console.error("Error loading exclusion words:", err);
    throw err;
  }
};

module.exports = {
  initializeConstants,
};
