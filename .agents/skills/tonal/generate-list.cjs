#!/usr/bin/env node

/**
 * generate-md-list.js
 *
 * Recursively scan a directory for Markdown files and output a Markdown list.
 *
 * Usage:
 *   node generate-md-list.js          # scans the current folder
 *   node generate-md-list.js <folder>  # scans the specified folder
 *
 * The output is written to stdout. Redirect it if you want a file, e.g.:
 *   node generate-md-list.js > README.md
 */

const fs = require("fs");
const path = require("path");

// ---------- Configuration ----------
/**
 * If you need custom title formatting (e.g., keep all caps, add prefixes),
 * replace the implementation of `formatTitle` below.
 */
function formatTitle(fileName) {
  // Remove extension
  const base = fileName.replace(/\.md$/i, "");

  // Split on non‑alphanumeric characters and capitalize each part
  return base
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ---------- Main logic ----------
function walkDir(dir, root) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let markdownFiles = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recurse into sub‑folder
      markdownFiles = markdownFiles.concat(walkDir(fullPath, root));
    } else if (
      entry.isFile() &&
      /^.+\.md$/i.test(entry.name) && // ends with .md (case‑insensitive)
      !/^index\.md$/i.test(entry.name) // optional: skip index.md
    ) {
      const relPath = path.relative(root, fullPath).replace(/\\/g, "/"); // POSIX style for Markdown links
      markdownFiles.push({ relPath, name: entry.name });
    }
  }

  return markdownFiles;
}

function generateMarkdownList(files) {
  if (files.length === 0) {
    console.log("No Markdown files found.");
    return "";
  }

  const lines = files.map((file) => {
    const title = formatTitle(file.name);
    return `- **${title}**: [\`${file.relPath}\`](${file.relPath})`;
  });

  // Join with two newlines for readability
  return lines.join("\n\n");
}

// ---------- Run ----------
(function () {
  const rootDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : process.cwd();

  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    console.error(`❌ The path "${rootDir}" is not a valid directory.`);
    process.exit(1);
  }

  const mdFiles = walkDir(rootDir, rootDir);
  const markdownList = generateMarkdownList(mdFiles);

  console.log(markdownList);
})();
