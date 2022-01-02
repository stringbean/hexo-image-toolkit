/* global hexo */

const postImg = require('./lib/post_img');
const { processAssets } = require('./lib/image_utils');

hexo.extend.tag.register(
  'post_img',
  function (args) {
    return postImg(hexo, args, this);
  },
  { async: true },
);

// TODO priority
hexo.extend.filter.register(
  'after_generate',
  function () {
    const hexo = this;
    return processAssets(hexo);
  },
  9,
);
