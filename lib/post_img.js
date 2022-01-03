const chalk = require('chalk');
const { parseOptions, compareImageTargets } = require('./utils');

// TODO leading slashes?
// TODO forced resize

/**
 * @param {ImageTarget} target
 */
function imageSrc(target) {
  return `        <source srcset="${target.path}" type="image/${target.format}"/>`;
}

/**
 * @param {ImageTarget[]} targets
 * @param {Map} config
 */
function generateMarkup(targets, config) {
  const fallback = targets.find((t) => t.fallback);

  const sourceElements = targets
    .filter((t) => !t.fallback)
    .sort(compareImageTargets)
    .map((t) => imageSrc(t));

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
${sourceElements}
        <img src="${fallback.path}" ${alt} />
    </picture>
    ${caption}
</figure>
`;
}

/**
 * @typedef {object} ImageTarget
 * @property {string} path
 * @property {boolean} [fallback]
 * @property {('webp'|'auto')} [format]
 * @property {number} [scale]
 */

/**
 *
 * @param {Hexo} hexo
 * @param args
 * @param post
 * @return {Promise<string>}
 */
module.exports = async function (hexo, args, post) {
  if (!post.published && !hexo._showDrafts()) {
    return Promise.resolve('');
  }

  // image should be first argument
  const image = args[0];

  // parse remaining args
  const config = parseOptions(args, true);

  const PostAsset = hexo.model('PostAsset');

  const imageAsset = PostAsset.findOne({ post: post._id, slug: image });

  if (!imageAsset) {
    hexo.log.warn(
      'Failed to find image asset: %s for post %s',
      image,
      post.slug,
    );

    // TODO fail
    throw new Error(`Cannot find asset [${image}]`);
  }

  hexo.log.debug(
    'Generating images for: %s',
    chalk.magenta(imageAsset.path.replace(/^\//, '')),
  );

  // TODO retina
  const targets = [
    {
      path: imageAsset.path,
      fallback: true,
    },
    {
      path: imageAsset.path.replace(/\..*$/, '.webp'),
      format: 'webp',
    },
  ];
  // TODO ensure auto doesn't happen for image type
  // TODO sizing

  // set target formats on asset - these will be processed by the filter
  await imageAsset.update({ postImgTargets: targets });

  return generateMarkup(targets, config);
};
