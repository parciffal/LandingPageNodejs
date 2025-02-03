const fs = require("fs");
const path = require("path");

const saveOutput = (data) => {
  const outputPath = path.resolve(__dirname, "../output.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Output saved to ${outputPath}`);
};

module.exports = { saveOutput };
