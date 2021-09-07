const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");

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
  async function fileToIpfs(filePath, { rename, isZippedDirectory = false, verbose = false } = {}) {
    const fileName = rename || path.basename(filePath);
    const publish = isZippedDirectory ? ipfsPublishZippedDirectory : ipfsPublishFile;
    const result = await publish(fileName, filePath);

    if (verbose) {
      console.log(JSON.stringify(result, null, 2));
    }

    return publish.parseResult(result);
  }

  async function ipfsPublishFile(fileName, filePath) {
    const content = await fs.promises.readFile(filePath);

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

  ipfsPublishFile.parseResult = (result) => {
    const [file, directory] = result;
    return `/ipfs${directory.path}${directory.hash}${file.path}`;
  };

  async function ipfsPublishZippedDirectory(fileName, filePath) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    return fetch(`${endpoint}/add-zipped-directory`, {
      method: "POST",
      body: formData,
      headers: {
        ...formData.getHeaders(),
        accept: "application/json",
      },
    })
      .then(async (response) => response.json())
      .then((success) => success.data);
  }

  ipfsPublishZippedDirectory.parseResult = (result) => {
    const [baseDir, root] = result.slice(-2);
    return `/ipfs${root.path}${root.hash}${baseDir.path}`;
  };

  return fileToIpfs;
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
