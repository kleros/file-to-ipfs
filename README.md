# File to IPFS

Utility to upload files to Kleros IPFS node. 

It can be used as a standalone CLI tool or a node module.

## Installation

```bash
yarn add @kleros/file-to-ipfs
# npm install --save @kleros/file-to-ipfs
```

## Usage

### CLI

```
Usage:
    Regular files:
      cli.js --file <file-path> [-v] [--rename <new-name>] [-e <ipfs-endpoint>]
    Directories inside a zip file that will be unzipped:
      cli.js --zipped-directory <zip-file-path> [-v] [--rename <new-name>] [-e
      <ipfs-endpoint>]

Options:
  -f, --file              The path of the file                          [string]
  -z, --zipped-directory  The path of the zip file containing a directory
                                                                        [string]
  -r, --rename            The new file name                             [string]
  -e, --endpoint          The IPFS endpoint
                                    [string] [default: "https://ipfs.kleros.io"]
  -v, --verbose           Whether it should display the full IPFS upload result
                          or not
  -h, --help              Show help                                    [boolean]
  -V, --version           Show version number                          [boolean]
```

### Module

#### `fileToIpfs`

Default usage.

```javascript
fileToIpfs(filePath, { rename?: string } = {}) => Promise<string>;
```

Params:
- `filePath`: The path to the file in the file system.
- `rename`: Provided if the name of the uploaded file should be different than the original.
- `isZippedDirectory`: Whether the file should be treated as a zipped directory or not.

Returns:
- `Promise<string>`: a promise for the IPFS path of the uploaded file.

Example:

```javascript
const fileToIpfs = require('@kleros/file-to-ipfs');

// Regular file
(async() => {
    const ipfsPath = await fileToIpfs('<path-to-file>');
    console.log(ipfsPath);
})();

// Zipped directory
(async() => {
    const ipfsPath = await fileToIpfs('<path-to-zip-file>', { isZippedDirectory: true });
    console.log(ipfsPath);
})();
```

#### `fileToIpfs.factory`

Allows to create another `file-to-ipfs` instance to upload files to a different IPFS endpoint.


```javascript
fileToIpfsFactory({ endpoint: string }) => fileToIpfs
```

Params:
- `endpoint`: The IPFS endpoint.

Returns:
- `fileToIpfs`: a new instance of the fileToIpfs function.


Example:

```javascript
const { factory } = require('@kleros/file-to-ipfs');

const fileToIpfs = factory({ endpoint: 'https://gateway.ipfs.io' });

(async() => {
    const ipfsPath = await fileToIpfs('<path-to-file>');
    console.log(ipfsPath);
})();
```

#### `fileToIpfs.DEFAULT_IPFS_ENDPOINT`

The value of the default IPFS endpoint

```javascript
const DEFAULT_IPFS_ENDPOINT: string = 'https://ipfs.kleros.io'
```
