/* global hexo */

hexo.extend.tag.register('post_img', require('./lib/post_img'), { async: true });