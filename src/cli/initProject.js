var fsExtra = require('fs-extra');
var shell = require('shelljs');

module.exports = function (seedPath, targetPath) {
    console.log('Setting up project');
    fsExtra.copySync(seedPath, targetPath);
    console.log('Installing dependencies');
    shell.exec('sh -c \'cd '+targetPath+' && npm install\'');
    console.log('Starting server');
    shell.exec('sh -c \'cd '+targetPath+' && npm start\'');
}