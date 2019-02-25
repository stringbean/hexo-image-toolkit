module.exports = {
  parseOptions: function(args, shift=true) {
    if (shift) {
      args.shift();
    }

    return config = new Map(args.map(a => a.split("=")));
  }
};