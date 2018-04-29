import {ProcessHandler} from 'n158/classes';
import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

// Init process handler
var processHandler = new ProcessHandler('./settings.yaml');

processHandler.set('demo-handler', (context, next, finish) => {
    finish(200, 'Hello world');
});

// Setup database
processHandler.startHTTPServers();