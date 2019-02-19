const sharp = require('sharp');
const path = require('path');
const fs = require('hexo-fs');

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


hexo.extend.tag.register('post_img', function (args) {
    const PostAsset = hexo.model('PostAsset');

    // image should be first argument
    const image = args[0];
    args.shift();

    const config = new Map(args.map(a => a.split("=")));

    // load the image
    const imgAsset = PostAsset.findOne({post: this._id, slug: image});

    const sharpImage = sharp(imgAsset.source);

    const destPath = imgAsset.path.replace(/\..*$/, '.webp');
    const destFile = path.join(hexo.public_dir, destPath);
    const destDir = path.dirname(destFile);

    return fs.mkdirs(destDir)
        .then(() => sharpImage.toFile(destFile))
        .then((info, err) => generateMarkup(config, destPath, imgAsset.path));
}, {async: true});
