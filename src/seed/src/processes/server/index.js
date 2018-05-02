import {ProcessHandler} from 'n158/classes';
import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

// Setup process handler settings
var procSettingsPath = path.join(__dirname, './settings.yaml');
var procSettings = yaml.safeLoad(fs.readFileSync(procSettingsPath, 'utf-8'));

// Init process handler
var processHandler = new ProcessHandler(procSettings);

// Setup server port
processHandler.set('httpPort', process.env.PORT || processHandler.get('httpPort'));

// Setup webapp
processHandler.set('demo-webapp', path.join(__dirname, './webapps/home'));

// Setup demo handler
processHandler.set('demo-handler', (context, next, finish) => {
    finish(200, 'Hello world');
});

// Start servers
processHandler.startHTTPServers().then((results) => {
    results.forEach((r) => {
        console.log('HTTP Server '+r.serverName+' is running at port '+r.ports.http);
    });
});