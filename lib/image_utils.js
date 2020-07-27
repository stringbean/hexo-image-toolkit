const sharp = require('sharp');
const fs = require('hexo-fs');
const path = require('path');
const chalk = require('chalk');

function processImage(hexo, image, metadata, asset, target) {
  if (target.default) {
    target.path = asset.path;
    return Promise.resolve(target);
  }

  let suffix = '';

  if (target.suffix) {
    suffix = '@' + target.suffix;
  }

  if (target.format === 'auto') {
    target.format = metadata.format;
    target.path = asset.path.replace(/\..*$/, `${suffix}.${metadata.format}`);
  } else {
    target.path = asset.path.replace(/\..*$/, `${suffix}.${target.format}`);
  }

  // TODO forced size
  let targetWidth = metadata.width;

  if (target.scale) {
    const scale = parseFloat(target.scale);
    targetWidth = Math.floor(metadata.width * scale);
  }

  const destFile = path.join(hexo.public_dir, target.path);

  return image
    .clone()
    .resize({ width: targetWidth })
    .toFile(destFile)
    .then(() => target);
}

module.exports = {
  convertImage: function(hexo, asset, targets) {
    const destDir = path.dirname(path.join(hexo.public_dir, asset.path));

    hexo.log.trace(
      'Converting %s to %s targets',
      chalk.magenta(asset.path),
      chalk.cyan(targets.length),
    );

    const image = sharp(asset.source);

    return fs
      .mkdirs(destDir)
      .then(() => {
        hexo.log.trace('Created image dir %s', chalk.magenta(destDir));

        // load the image metadata
        return image.metadata();
      })
      .then(metadata => {
        const ps = targets.map(target =>
          processImage(hexo, image, metadata, asset, target),
        );
        return Promise.all(ps);
      });
  },
};
