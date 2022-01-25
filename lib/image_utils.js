const sharp = require('sharp');
const chalk = require('chalk');
const { extractFormatFromPath } = require('./utils');

/**
 * @param {Hexo} hexo
 * @param {{asset: PostAsset, operation: ImageOperation, renderedSource: RenderedSource, sourceElement: SourceElement}} action
 * @return {Promise<void>}
 */
async function processAction(hexo, action) {
  const { asset, operation, renderedSource, sourceElement } = action;
  const image = sharp(asset.source);

  const { basePath, format } = extractFormatFromPath(operation.path);
  const targetFormat =
    renderedSource.format !== 'auto' ? renderedSource.format : format;

  const targetPath = sourceElement.selector
    ? `${basePath}@${sourceElement.selector}.${targetFormat}`
    : `${basePath}.${targetFormat}`;

  hexo.log.trace(
    'Converting %s to %s',
    chalk.magenta(asset.path),
    chalk.cyan(targetPath),
  );

  // register the image path with the router - the conversion will occur asynchronously when Hexo is ready
  hexo.route.set(targetPath, function () {
    return image
      .clone()
      .resize(sourceElement.size)
      .toFormat(targetFormat)
      .toBuffer();
  });
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

    const actions = PostAsset.find({})
      .filter((asset) => asset.postImgOperation)
      .map((asset) => {
        const operation = asset.postImgOperation;

        return operation.renderedSources
          .map((renderedSource) => {
            return renderedSource.elements.map((sourceElement) => {
              return { asset, operation, renderedSource, sourceElement };
            });
          })
          .flat();
      })
      .flat();

    return Promise.all(actions.map((action) => processAction(hexo, action)));
  },
};
