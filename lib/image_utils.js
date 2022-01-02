const sharp = require('sharp');
const chalk = require('chalk');

/**
 * @typedef {object} ImageOperation
 * @property {boolean} [fallback]
 * @property {('webp'|'auto')} [format]
 * @property {string} [suffix]
 * @property {number} [scale]
 */

/**
 *
 * @param {Hexo} hexo
 * @param {ImageOperation} target
 * @return {Promise<void>}
 */
async function processImage(hexo, target) {
  if (target.fallback) {
    // fallback image - no need to convert
    return;
  }

  hexo.log.trace(
    'Converting %s to %s',
    chalk.magenta(target.asset.path),
    chalk.cyan(target.path),
  );

  const image = sharp(target.asset.source);
  const metadata = await image.metadata();

  // TODO resizing
  const targetWidth = metadata.width;
  const targetHeight = metadata.height;

  const targetFormat = target.format ? target.format : metadata.format;
  const targetPath = target.asset.path.replace(/\..*$/, `.${target.format}`);

  // register the image path with the router - the conversion will occur asynchronously when Hexo is ready
  hexo.route.set(
    targetPath,
    image
      .clone()
      .resize({ width: targetWidth, height: targetHeight })
      .toFormat(targetFormat)
      .toBuffer(),
  );
}

module.exports = {
  /**
   * Scans the post assets for pending image operations and runs them.
   *
   * @param {Hexo} hexo
   * @return {Promise<void[]>}
   */
  processAssets: function (hexo) {
    const PostAsset = hexo.model('PostAsset');

    const targets = PostAsset.find({})
      .filter((image) => image.postImgTargets)
      .map((image) => {
        const targets = image.postImgTargets;
        targets.forEach((target) => (target.asset = image));
        return targets;
      })
      .flat();

    return Promise.all(targets.map((target) => processImage(hexo, target)));
  },
};
