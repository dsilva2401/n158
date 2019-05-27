import {ExpressServer} from './ExpressServer';
import yaml from 'js-yaml';
import path from 'path';
import fs from 'fs';

export class ProcessHandler {
    
    constructor (_settings) {
        this.settings = this._resolveSettingsParams(_settings);
        this.procVariablesMap = {};
        this.httpServersMap = {};
        this._setupVars();
    }

    set (key, value) {
        this.procVariablesMap[key] = value;
    }
    
    get (key) {
        return this.procVariablesMap[key];
    }

    _resolveSettingsParams (settings) {
        if (typeof settings == 'object') {
            return settings;
        }
        if (typeof settings == 'string') {
            if (settings.match(/.yaml$/)) {
                var procSettingsPath = path.resolve(settings);
                var procSettings = yaml.safeLoad(fs.readFileSync(procSettingsPath, 'utf-8'));
                return procSettings;
            }
            if (settings.match(/.json$/)) {
                var procSettingsPath = path.resolve(settings);
                var procSettings = JSON.parse(fs.readFileSync(procSettingsPath, 'utf-8'));
                return procSettings;
            }
            throw Error ('n158 => ProcessHandler: Invalid settings file path');
            return;
        }
        throw Error ('n158 => ProcessHandler: Invalid settings param');
        return;
    }

    _setupVars () {
        Object.keys(this.settings.vars || {}).forEach((k) => {
            this.set(k, this.settings.vars[k]);
        });
    }

    _resolveHandler (pipelineItemData, routeSettings) {
        return (req, res, next) => {
            req.locals = req.locals || {};
            if (pipelineItemData.skipWhenErrors && req.locals.status) {
                var sType = Math.floor(req.locals.status / 100);
                if ( sType == 4 || sType == 5 ) {
                    next();
                    return;
                }
            }
            var procSelf = this;
            pipelineItemData.handler({
                processGet: (key) => { return procSelf.get(key); },
                processSet: (key, value) => { return procSelf.set(key, value); },
                params: pipelineItemData.params || {},
                routeSettings: routeSettings,
                req: req,
                res: res,
                set: (key, value) => { req.locals[key] = value },
                get: (key) => { return req.locals[key] },
            }, (status, data) => {
                req.locals.status = status;
                req.locals.data = data;
                next();
            }, (status, data) => {
                var fStatus = status || req.locals.status || 200;
                var fData = data || req.locals.data || {};
                res.status(fStatus);
                res.send(fData);
                res.end();
            });
        }
    }
    
    _attachHTTPServer (name, serverSettings) {
        // Init server
        var server = new ExpressServer();
        this.httpServersMap[name] = {}
        this.httpServersMap[name].settings = serverSettings;
        this.httpServersMap[name].server = server;
        // Setup routers
        serverSettings.routers.forEach((routerData) => {
            server.addRouter(routerData.name, routerData.path);
            routerData.routes.forEach((routeData) => {
                routeData.pipeline.push({
                    handler: (context, next, finish) => {
                        finish();
                    }
                });
                routeData.pipeline.forEach((pipelineItemData) => {
                    var handlerSetup = {
                        method: routeData.method,
                        path: routeData.path,
                    }
                    if (pipelineItemData.staticsPath) {
                        handlerSetup.staticsPath = pipelineItemData.staticsPath;
                    } else {
                        handlerSetup.handler = this._resolveHandler(
                            pipelineItemData,
                            routeData
                        )
                    }
                    server.addRoute(routerData.name, handlerSetup);
                });
            })
        });
    }

    _resolveSettings (settings) {
        var VAR_CHAR = '$';
        var r = (value) => {
            var fValue = value;
            if (typeof value == 'string') {
                if (value[0] == VAR_CHAR) {
                    fValue = this.get(value.substring(1, value.length));
                }
            } else if (typeof value == 'object') {
                if ( !Array.isArray(value) ) {
                    Object.keys(value).forEach((k) => {
                        value[k] = r(value[k]);
                    });
                } else {
                    value = value.map((item) => {
                        return r(item);
                    });
                }
            }
            return fValue;
        }
        return r(settings);
    }

    _setupHTTPServers () {
        var settings = this._resolveSettings(this.settings);
        settings.httpServers.forEach((httpServerData) => {
            this._attachHTTPServer(httpServerData.name, httpServerData);
        });
    }

    startHTTPServers (credentials) {
        this._setupHTTPServers();
        return Promise.all(
            Object.keys(this.httpServersMap).map((serverName) => {
                var buffServer = this.httpServersMap[serverName].server;
                var buffServerSettings = this.httpServersMap[serverName].settings;
                return new Promise((resolve) => {
                    buffServer.start(buffServerSettings.ports.http, buffServerSettings.ports.https, credentials).then((ports) => {
                        resolve({
                            serverName: serverName,
                            ports: ports
                        });
                    });
                });
            })
        );
    }

    startDaemons () {}

}