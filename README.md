# Hexo Image Toolkit

![npm (scoped)](https://img.shields.io/npm/v/@string-bean/hexo-image-toolkit)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/stringbean/hexo-image-toolkit/ci.yml?branch=main)
![NPM](https://img.shields.io/npm/l/@string-bean/hexo-image-toolkit)

Hexo tag plugin for converting & resizing images and generating associated markup.

## Install

Install the package:

```shell
npm install -S @string-bean/hexo-image-toolkit
```

Then ensure that you have [asset folders](https://hexo.io/docs/asset-folders) enabled in your Hexo `_config.yml`:

```yaml
post_asset_folder: true
```

## Usage

Given the following Markdown with `example.jpg` having a size of 2048x1536 pixels:

```markdown
{% post_img example.jpg title="An example image" retina %}
```

The following HTML will be generated:

```html

<figure class="image">
    <picture>
        <source srcset="/post-path/example@2x.webp 2x, /post-path/example.webp" type="image/webp"/>
        <img src="/post-path/example.jpg" alt="An example image" width="1024" height="768"/>
    </picture>

    <figcaption>
        <span>An example image</span>
    </figcaption>
</figure>
```

Along with the following image assets:

- `/post-path/example@2x.webp` - sized 2048x1536
- `/post-path/example.webp` - sized 1024x768
- `/post-path/example.jpg` - sized 1024x768

## Options

| Name     | Default       | Description                                                                         |
|----------|---------------|-------------------------------------------------------------------------------------|
| `title`  | _required_    | Title to use in the figure caption.                                                 |
| `alt`    | _title value_ | Text to use for the `alt` tag. If not supplied then the `title` value will be used. |
| `retina` | `false`       | If `true` then the                                                                  |
| `width`  | _none (auto)_ | Fixed width to resize the image to.                                                 |
| `height` | _none (auto)_ | Fixed height to resize the image to.                                                |

### Image Sizing

By default, the size of the input image is used for both the WEBP and fallback images. If the `retina` flag is set then
this size will be used for the 2x image and fallback images generated at a quarter of the resolution.

For example, given an input image with a size of 2000x1000 pixels:

| `retina` | `width` | `height` | 2x webp Size | Standard webp Size | Fallback Size | `img` Tag Size |
|----------|---------|----------|--------------|--------------------|---------------|----------------|
| `false`  | unset   | unset    | _none_       | 2000x1000          | 2000x1000     | 2000x1000      |
| `false`  | `400`   | unset    | _none_       | 400x200            | 400x200       | 400x200        |
| `false`  | unset   | `2000`   | _none_       | 4000x2000          | 4000x2000     | 4000x2000      |
| `false`  | `1500`  | `300`    | _none_       | 1500x300           | 1500x300      | 1500x300       |
| `true`   | unset   | unset    | 2000x1000    | 1000x500           | 1000x500      | 1000x500       |
| `true`   | `400`   | unset    | 400x200      | 200x100            | 200x100       | 200x100        |
