var fsExtra = require('fs-extra');

module.exports = function (seedPath, targetPath) {
    fsExtra.copySync(seedPath, targetPath);
}