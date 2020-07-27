/* global hexo */

const chalk = require('chalk');
const { parseOptions } = require('./utils');
const { convertImage } = require('./image_utils');

// TODO leading slashes?
// TODO forced resize

function generateImageSource(images, imageType) {
  const sourceImages = images.filter((i) => i.format === imageType);

  if (sourceImages.length === 0) {
    return '';
  }

  const srcs = sourceImages.map((i) => {
    let suffix = '';

    if (i.suffix) {
      suffix = i.suffix;
    }

    return `${i.path} ${suffix}`
  }).join(', ');

  return  `\n    <source srcset="${srcs}" type="image/${imageType}">`;
}

function generateMarkup(config, images) {
  const fallback = images.find((i) => i.default);

  let caption = '';

  if (config.has('title')) {
    caption = `      <figcaption><span>${config.get('title')}</span></figcaption>`
  }

  return `
<figure class="image">
    <picture>
${generateImageSource(images, 'webp')}
${generateImageSource(images, 'png')}
${generateImageSource(images, 'jpeg')}
      <img src="${fallback.path}">
${caption}
    </picture>
</figure>
`;
}

module.exports = (hexo) => function(args) {
  const PostAsset = hexo.model('PostAsset');

  // image should be first argument
  const image = args[0];
  // parse remaining args
  const config = parseOptions(args, true);

  // load the image asset
  const imgAsset = PostAsset.findOne({post: this._id, slug: image});
  if (!imgAsset) {
    hexo.log.error('Failed to find image asset: %s', image);
    return Promise.reject(new Error('Failed to find image asset'));
  }

  hexo.log.debug('Generating images for: %s', chalk.magenta(imgAsset.path.replace(/^\//, '')));

  let targets = [
    { default: true },
  ];

  if (config.has('retina')) {
    targets.push(
      {format: 'auto', suffix: '2x'},
      {format: 'auto', suffix: '1x', scale: 0.5},
      {format: 'webp', suffix: '2x'},
      {format: 'webp', suffix: '1x', scale: 0.5}
    );
  } else {
    targets.push(
      {format: 'webp'}
    );
  }

  return convertImage(imgAsset, targets)
    .then((images) => generateMarkup(config, images))
    .catch((err) => {
      hexo.log.error('Failed to generate images: %s', err);
      return Promise.reject(new Error('Failed to generate images'));
    });
};