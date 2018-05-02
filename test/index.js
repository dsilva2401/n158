// Imports
var path = require('path');
var yaml = require('js-yaml');
var fs = require('fs');
var n158Classes = require('../classes');
// console.log(n158Classes.ProcessHandler);

// Setup handlers
var processHandler = new n158Classes.ProcessHandler('./settings.yaml');

// Setup http port
processHandler.set('httpPort', process.env.PORT || processHandler.get('httpPort'));

// Setup webapp
processHandler.set('demo-webapp', path.join(__dirname, './webapps/home'));

// Setup demo handler
processHandler.set('demo-handler', (context, next, finish) => {
    finish(200, 'Hello world');
});

// Start servers
processHandler.startHTTPServers().then(function (results) {
    results.forEach((r) => {
        console.log('HTTP Server '+r.serverName+' is running at port '+r.ports.http);
    });
})
