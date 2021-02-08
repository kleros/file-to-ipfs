const path = require("path");
const fs = require("fs").promises;
const fetch = require("node-fetch");

const DEFAULT_IPFS_ENDPOINT = "https://ipfs.kleros.io";

module.exports = factory({
  endpoint: DEFAULT_IPFS_ENDPOINT,
});

module.exports.factory = factory;

module.exports.DEFAULT_IPFS_ENDPOINT = DEFAULT_IPFS_ENDPOINT;

/**
 * @type FileToIpfsFactory
 */
function factory({ endpoint }) {
  /**
   * @type FileToIpfs
   */
  return async function fileToIpfs(filePath, { rename, verbose = false } = {}) {
    const fileName = rename || path.basename(filePath);
    const content = await fs.readFile(filePath);

    const result = await ipfsPublish(fileName, content);

    if (verbose) {
      console.log(JSON.stringify(result, null, 2));
    }

    const [file, directory] = result;
    return `/ipfs${directory.path}${directory.hash}${file.path}`;
  };

  async function ipfsPublish(fileName, content) {
    return fetch(`${endpoint}/add`, {
      method: "POST",
      body: JSON.stringify({
        fileName,
        buffer: content,
      }),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((success) => success.data);
  }
}

/**
 * Creates an instance of FileToIpfs.
 * @callback FileToIpfsFactory
 * @param {FactoryOptions} options The options to configure the instance.
 * @returns {FileToIpfs} A function to upload files to IPFS.
 */

/**
 * @typedef {Object} FactoryOptions
 * @prop {string} endpoint The IPFS endpoint to upload the files to.
 */

/**
 * Sends a file from the file system to the IPFS node.
 * @callback FileToIpfs
 * @param {string} filePath The path to the file to upload.
 * @param {Options} [options] The configuration options
 * @returns {Promise<string>} The IPFS path of the file
 */

/**
 * @typedef {Object} Options
 * @prop {string} [rename] Provided if the name of the uploaded file should be different than the original.
 * @prop {boolean} [verbose = false] Whether or not to send the response of the request to stdout.
 */
