import {ProcessHandler} from 'n158/classes';
import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

var procSettingsPath = path.join(__dirname, './settings.yaml');
var procSettings = yaml.safeLoad(fs.readFileSync(procSettingsPath, 'utf-8'));

// Init process handler
var processHandler = new ProcessHandler(procSettings);

// Setup webapp
processHandler.set('demo-webapp', path.join(__dirname, './webapps/home'));

// Setup demo handler
processHandler.set('demo-handler', (context, next, finish) => {
    finish(200, 'Hello world');
});

// Setup database
processHandler.startHTTPServers();