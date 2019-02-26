/* global hexo */

const sharp = require("sharp");
const fs = require("hexo-fs");
const path = require("path");
const chalk = require('chalk');

module.exports = {
  convertImage: function(asset) {
    const destPath = asset.path.replace(/\..*$/, ".webp");
    const destFile = path.join(hexo.public_dir, destPath);
    const destDir = path.dirname(destFile);

    const image = sharp(asset.source);

    return fs.mkdirs(destDir)
      .then(() => {
        hexo.log.debug("Converting %s to %s", chalk.magenta(asset.path), chalk.magenta(destPath));
        return image.toFile(destFile);
      }).then(() => destPath);
  }
};