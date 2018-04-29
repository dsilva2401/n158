// var q = require('q');
// var mongodb = require('mongodb');
// var underscore = require('underscore');
// var JSONSchema = require('jsonschema');
// var validateJSONSchema = JSONSchema.validate;
// var ObjectID = mongodb.ObjectID;
import {ExpressServer} from './ExpressServer';

export class ProcessHandler {
    
    constructor (settings) {
        this.settings = settings;
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

    _setupVars () {
        Object.keys(this.settings.vars || {}).forEach((k) => {
            this.set(k, this.settings.vars[k]);
        });
    }

    _resolveHandler (handler, params, routeSettings) {
        return (req, res, next) => {
            req.locals = req.locals || {};
            handler({
                params: params || {},
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
                routeData.pipeline.forEach((pipelineItemData) => {
                    var handlerSetup = {
                        method: routeData.method,
                        path: routeData.path,
                    }
                    if (pipelineItemData.staticsPath) {
                        handlerSetup.staticsPath = pipelineItemData.staticsPath;
                    } else {
                        handlerSetup.handler = this._resolveHandler(
                            pipelineItemData.handler,
                            pipelineItemData.params,
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

    startHTTPServers () {
        this._setupHTTPServers();
        Object.keys(this.httpServersMap).forEach((serverName) => {
            this.httpServersMap[serverName].server.start(
                this.httpServersMap[serverName].settings.ports.http
            )
        })
    }

    startDaemons () {}

}