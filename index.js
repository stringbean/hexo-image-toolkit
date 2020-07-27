/* global hexo */

const postImg = require('./lib/post_img');

hexo.extend.tag.register(
  'post_img',
  function(args) {
    return postImg(hexo, args, this);
  },
  { async: true },
);
