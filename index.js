/* global hexo */

const renderTag = require('./lib/post_img');

hexo.extend.tag.register('post_img', renderTag(hexo), { async: true });