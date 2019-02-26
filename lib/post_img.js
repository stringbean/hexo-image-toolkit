/* global hexo */

const chalk = require('chalk');
const { parseOptions } = require('./utils');
const { convertImage } = require('./image_utils');

function generateMarkup(config, webp, fallback) {
  let alt = '';
  let caption = '';

  if (config.has('title')) {
    const title = config.get('title');
    alt = title;
    caption = `<figcaption><span>${title}</span></figcaption>`;
  }

  if (config.has('alt')) {
    alt = config.get('alt');
  }

  let widthAttribute = '';

  if (config.has('width')) {
    widthAttribute = `width="${config.get('width')}"`;
  }

  return `
<figure class="image">
    <picture>
        <source srcset="${webp}" type="image/webp">
        <img src=${fallback} alt="${alt}" ${widthAttribute}>
    </picture>
    ${caption}
</figure>
`;
}

module.exports = function(args) {
  const PostAsset = hexo.model('PostAsset');

  // image should be first argument
  const image = args[0];
  // parse remaining args
  const config = parseOptions(args, true);

  // load the image
  const imgAsset = PostAsset.findOne({post: this._id, slug: image});
  hexo.log.debug('Generating images for: %s', chalk.magenta(imgAsset.path.replace(/^\//, '')));

  return convertImage(imgAsset)
    .then((webpPath) => {
      hexo.log.info('Generated images for: %s', chalk.magenta(imgAsset.path.replace(/^\//, '')));
      return generateMarkup(config, webpPath, imgAsset.path)
    })
    .catch((err) => {
      hexo.log.error('Failed to generate images: %s', err);
    });
};