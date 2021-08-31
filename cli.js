#!/usr/bin/env node
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const fileToIpfs = require("./file-to-ipfs");

const { factory, DEFAULT_IPFS_ENDPOINT } = fileToIpfs;

const demandOneOfOption = (options) => (argv) => {
  const count = options.filter((option) => argv[option]).length;
  const lastOption = options.pop();

  if (count === 0) {
    throw new Error(`Exactly one of the arguments ${options.join(", ")} and ${lastOption} is required`);
  } else if (count > 1) {
    throw new Error(`Arguments ${options.join(", ")} and ${lastOption} are mutually exclusive`);
  }

  return true;
};

const argv = yargs(hideBin(process.argv))
  .locale("en")
  .usage(
    `Usage:
    Regular files:
      $0 --file <file-path> [-v] [--rename <new-name>] [-e <ipfs-endpoint>]
    Directories inside a zip file that will be unzipped:
      $0 --zipped-directory <zip-file-path> [-v] [-e <ipfs-endpoint>]`
  )
  .option("f", {
    description: "The path of the file",
    alias: "file",
  })
  .option("z", {
    description: "The path of the zip file containing a directory",
    alias: "zipped-directory",
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
  .check(demandOneOfOption(["f", "z"]))
  .conflicts("z", ["f", "r"])
  .string(["f", "z", "r", "e"])
  .coerce(["f", "z"], path.resolve)
  .coerce(["e"], (arg) => String(arg).replace(/\/+$/, "")).argv;

(async () => {
  const endpoint = argv.endpoint;
  const instance = endpoint ? factory({ endpoint }) : fileToIpfs;

  const item = argv.file ? { type: "file", path: argv.file } : { type: "zipped-directory", path: argv.zippedDirectory };

  try {
    const ipfsPath = await instance(item.path, {
      rename: argv.rename,
      verbose: argv.verbose,
      isZippedDirectory: item.type === "zipped-directory",
    });

    console.log(ipfsPath);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
