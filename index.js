#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const DEFAULT_IPFS_ENDPOINT = "https://ipfs.kleros.io";

const argv = yargs(hideBin(process.argv))
  .locale("en")
  .usage(
    `Usage: $0 --file <file-path>
    [-v] [--rename <new-name>] [-e <ipfs-endpoint>]`
  )
  .option("f", {
    description: "The path of the file",
    alias: "file",
  })
  .option("r", {
    description: "The new file name",
    alias: "rename",
  })
  .option("e", {
    description: "The IPFS endpoint",
    alias: "endpoint",
    default: DEFAULT_IPFS_ENDPOINT,
  })
  .option("v", {
    description: "Whether it should display the full IPFS upload result or not",
    alias: "verbose",
  })
  .option("h", {
    alias: "help",
  })
  .option("V", {
    alias: "version",
  })
  .string(["f", "r", "e"])
  .coerce(["f"], path.resolve)
  .demand(["f"])
  .coerce(["e"], (arg) => String(arg).replace(/\/+$/, "")).argv;

(async () => {
  const file = argv.file;
  const fileName = argv.rename || path.basename(file);

  const contents = fs.readFileSync(file);

  try {
    const data = await ipfsPublish(fileName, contents);
    if (argv.verbose) {
      console.log(JSON.stringify(data, null, 2));
    }

    const [file, directory] = data;
    console.log(`/ipfs${directory.path}${directory.hash}${file.path}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

async function ipfsPublish(fileName, contents) {
  return fetch(`${argv.endpoint}/add`, {
    method: "POST",
    body: JSON.stringify({
      fileName,
      buffer: contents,
    }),
    headers: {
      "content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((success) => success.data);
}
