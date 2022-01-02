function typeToOrder(type) {
  switch (type) {
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
  parseOptions: function (args, shift = true) {
    if (shift) {
      args.shift();
    }

    return new Map(args.map((a) => a.split('=')));
  },
  /**
   * Comparator that sorts ImageTargets by type, scale and name.
   *
   * @param {ImageOperation} l first target to compare.
   * @param {ImageOperation} r second target to compare.
   */
  compareImageTargets: function (l, r) {
    const typeRank = typeToOrder(l.format) - typeToOrder(r.format);

    if (typeRank !== 0) {
      return typeRank;
    }

    // TODO sort by scale

    // finally, fall back to path
    return l.path.localeCompare(r.path);
  },
};
