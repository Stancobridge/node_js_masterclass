let helpers = {};
helpers.stripSlashes = (string) => {
    string = string.replace(/^\/+|\/+$/g, '');
    return string;
}

 module.exports = helpers;