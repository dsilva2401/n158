var path = require('path');
var argv = require('yargs').argv;
var initProject = require('./initProject');

// Arguments setup
var action = process.argv[2];

switch (action) {
    case 'init':
        if (!argv.name) {
            console.log('--name argument must be passed');
            return;
        }
        var seedPath = path.join(__dirname, '../seed');
        var targetPath = path.join(process.cwd(), argv.name);
        initProject(seedPath, targetPath);
    break;
    default:
        console.log('action param is required');
    break;
}