#!/usr/bin/env node
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fileToIpfs = require("./file-to-ipfs");

const { factory, DEFAULT_IPFS_ENDPOINT } = fileToIpfs;

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
  const endpoint = argv.endpoint;
  const instance = endpoint ? factory({ endpoint }) : fileToIpfs;

  try {
    const ipfsPath = await instance(argv.file, {
      rename: argv.rename,
      verbose: argv.verbose,
    });

    console.log(ipfsPath);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
