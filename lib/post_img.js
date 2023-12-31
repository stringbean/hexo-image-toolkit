const sharp = require('sharp');
const chalk = require('chalk');
const {
  parseOptions,
  scaleSize,
  compareRenderedSources,
  extractFormatFromPath,
  ratioSize,
} = require('./utils');

// TODO leading slashes?
// TODO forced resize

/**
 * @typedef {object} ImageOperation
 * @property {string} path source path of the image.
 * @property {ImageSize} displaySize
 * @property {RenderedSource[]} renderedSources
 */

/**
 * @typedef {object} RenderedSource
 * @property {SourceElement[]} elements
 * @property {('webp'|'auto')} [format] defaults to 'auto'.
 */

/**
 * @typedef {object} SourceElement
 * @property {ImageSize} size
 * @property {string} [selector]
 */

/**
 * @typedef {object} ImageSize
 * @property {number} width
 * @property {number} height
 */

/**
 *
 * @param {ImageOperation} operation
 * @param {RenderedSource} source
 */
function renderSource(operation, source) {
  const { basePath, format } = extractFormatFromPath(operation.path);
  const targetFormat = source.format !== 'auto' ? source.format : format;

  const srcesetElements = source.elements.map((elem) => {
    if (elem.selector) {
      return `${basePath}@${elem.selector}.${targetFormat} ${elem.selector}`;
    } else {
      return `${basePath}.${targetFormat}`;
    }
  });

  return `        <source srcset="${srcesetElements.join(', ')}" type="image/${
    source.format
  }"/>`;
}

/**
 * @param {ImageOperation} operation
 * @param {Map} config
 */
function generateMarkup(operation, config) {
  const sourceElements = operation.renderedSources
    .sort(compareRenderedSources)
    .map((src) => renderSource(operation, src));

  const title = config.get('title');

  let caption = '';
  if (title) {
    caption = `<figcaption><span>${title}</span></figcaption>`;
  }

  const altTitle = config.has('alt') ? config.get('alt') : title;

  let alt = '';
  if (altTitle) {
    alt = `alt="${altTitle}"`;
  }

  return `
<figure class="image">
    <picture>
${sourceElements.join('\n')}
        <img src="${operation.path}" ${alt} width="${
          operation.displaySize.width
        }" height="${operation.displaySize.height}"/>
    </picture>
    ${caption}
</figure>
`;
}

/**
 *
 * @param {Hexo} hexo
 * @param args
 * @param post
 * @return {Promise<string>}
 */
module.exports = async function (hexo, args, post) {
  if (!post.published && !hexo._showDrafts()) {
    return '';
  }

  // image should be first argument
  const imagePath = args[0];

  // parse remaining args
  const config = parseOptions(args, true);
  const retina = config.has('retina');

  // extract image from post
  const PostAsset = hexo.model('PostAsset');
  const imageAsset = PostAsset.findOne({ post: post._id, slug: imagePath });

  if (!imageAsset) {
    hexo.log.warn(
      'Failed to find image asset: %s for post %s',
      imagePath,
      post.slug,
    );

    throw new Error(`Cannot find asset [${imagePath}]`);
  }

  hexo.log.debug(
    'Generating markup for: %s',
    chalk.magenta(imageAsset.path.replace(/^\//, '')),
  );

  // load the image
  const image = sharp(imageAsset.source);
  const metadata = await image.metadata();

  /** @type ImageSize **/
  const imageSize = {
    width: metadata.width,
    height: metadata.height,
  };

  const fixedWidth = config.has('width')
    ? parseInt(config.get('width'))
    : undefined;
  const fixedHeight = config.has('height')
    ? parseInt(config.get('height'))
    : undefined;

  if (fixedWidth && fixedHeight) {
    imageSize.width = fixedWidth;
    imageSize.height = fixedHeight;
  } else if (fixedWidth) {
    imageSize.height = ratioSize(imageSize.width, fixedWidth, imageSize.height);
    imageSize.width = fixedWidth;
  } else if (fixedHeight) {
    imageSize.width = ratioSize(imageSize.height, fixedHeight, imageSize.width);
    imageSize.height = fixedHeight;
  }

  const displaySize = scaleSize(imageSize, retina ? 2 : 1);

  /** @type SourceElement[] */
  const elems = retina
    ? [{ size: imageSize, selector: '2x' }, { size: displaySize }]
    : [{ size: displaySize }];

  /** @type RenderedSource[] */
  const renderedSources = [{ format: 'webp', elements: elems }];

  /** @type ImageOperation */
  const operation = {
    path: imageAsset.path,
    displaySize,
    renderedSources,
  };

  // set target formats on asset - these will be processed by the filter
  await imageAsset.update({ postImgOperation: operation });

  return generateMarkup(operation, config);
};
