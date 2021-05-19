module.exports = {
  // Each module.id is incremented based on resolving order by default. Meaning when the order of resolving
  // is changed, the IDs will be changed as well. Adding a new js file for example will change the order.
  // Module ids by default are referenced by their numberic id which can cause changes in the minified
  // code of many files even though the original code has only changed in one place. Using "hashed"
  // creates a hashed module reference based on the filename which prevents the order id issue. This is
  // much better for caching on the website.
  optimization: { moduleIds: "hashed" }
};
