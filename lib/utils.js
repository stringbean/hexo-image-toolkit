function formatToOrder(format) {
  switch (format) {
    case 'webp':
      return 0;
    case 'png':
      return 1;
    case 'jpg':
      return 2;
    default:
      return 3;
  }
}

module.exports = {
  /**
   * @return {Map<string, string>}
   */
  parseOptions: function (args, shift = true) {
    if (shift) {
      args.shift();
    }

    return new Map(args.map((a) => a.split('=')));
  },
  /**
   * Comparator that sorts RenderedSource by type, scale and name.
   *
   * @param {RenderedSource} l
   * @param {RenderedSource} r
   */
  compareRenderedSources: function (l, r) {
    return formatToOrder(l.format, r.format);
  },

  /**
   * @param path
   * @return {{basePath: string, format: string}}
   */
  extractFormatFromPath: function (path) {
    const [, basePath, format] = path.match(/(.*)(?:\.)(?!.*\.)(.*)$/);

    return {
      basePath,
      format,
    };
  },

  /**
   * @param {ImageSize} size
   * @param {number} scale
   * @return {ImageSize}
   */
  scaleSize: function (size, scale) {
    return {
      width: Math.round(size.width / scale),
      height: Math.round(size.height / scale),
    };
  },

  /**
   * Scales a dimension using the ratio between the (other) original dimension and the target value for that dimension.
   *
   * @param {number} original the original value of the scaled dimension.
   * @param {number} target the resulting size of the scaled dimension.
   * @param {number} value the dimension to scale.
   * @return {number} the resulting scaled dimension.
   */
  ratioSize: function (original, target, value) {
    const ratio = target / original;
    return Math.round(value * ratio);
  },
};
