const axios = require("axios");
const { URL } = require("url");

const makeRequest = async (url) => {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        Host: host, // Set the Host header dynamically
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error.message);
    return null;
  }
};

module.exports = { makeRequest };
