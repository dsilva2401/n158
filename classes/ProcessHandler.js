'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ProcessHandler = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ExpressServer = require('./ExpressServer');

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ProcessHandler = exports.ProcessHandler = function () {
    function ProcessHandler(settings) {
        _classCallCheck(this, ProcessHandler);

        this.settings = this._resolveSettings(settings);
        this.procVariablesMap = {};
        this.httpServersMap = {};
        this._setupVars();
    }

    _createClass(ProcessHandler, [{
        key: 'set',
        value: function set(key, value) {
            this.procVariablesMap[key] = value;
        }
    }, {
        key: 'get',
        value: function get(key) {
            return this.procVariablesMap[key];
        }
    }, {
        key: '_resolveSettings',
        value: function _resolveSettings(settings) {
            if ((typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) == 'object') {
                return settings;
            }
            if (typeof settings == 'string') {
                if (settings.match(/.yaml$/)) {
                    var procSettingsPath = _path2.default.resolve(settings);
                    var procSettings = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(procSettingsPath, 'utf-8'));
                    return procSettings;
                }
                if (settings.match(/.json$/)) {
                    var procSettingsPath = _path2.default.resolve(settings);
                    var procSettings = JSON.parse(_fs2.default.readFileSync(procSettingsPath, 'utf-8'));
                    return procSettings;
                }
                throw Error('n158 => ProcessHandler: Invalid settings file path');
                return;
            }
            throw Error('n158 => ProcessHandler: Invalid settings param');
            return;
        }
    }, {
        key: '_setupVars',
        value: function _setupVars() {
            var _this = this;

            Object.keys(this.settings.vars || {}).forEach(function (k) {
                _this.set(k, _this.settings.vars[k]);
            });
        }
    }, {
        key: '_resolveHandler',
        value: function _resolveHandler(handler, params, routeSettings) {
            return function (req, res, next) {
                req.locals = req.locals || {};
                handler({
                    params: params || {},
                    routeSettings: routeSettings,
                    req: req,
                    res: res,
                    set: function set(key, value) {
                        req.locals[key] = value;
                    },
                    get: function get(key) {
                        return req.locals[key];
                    }
                }, function (status, data) {
                    req.locals.status = status;
                    req.locals.data = data;
                    next();
                }, function (status, data) {
                    var fStatus = status || req.locals.status || 200;
                    var fData = data || req.locals.data || {};
                    res.status(fStatus);
                    res.send(fData);
                    res.end();
                });
            };
        }
    }, {
        key: '_attachHTTPServer',
        value: function _attachHTTPServer(name, serverSettings) {
            var _this2 = this;

            // Init server
            var server = new _ExpressServer.ExpressServer();
            this.httpServersMap[name] = {};
            this.httpServersMap[name].settings = serverSettings;
            this.httpServersMap[name].server = server;
            // Setup routers
            serverSettings.routers.forEach(function (routerData) {
                server.addRouter(routerData.name, routerData.path);
                routerData.routes.forEach(function (routeData) {
                    routeData.pipeline.forEach(function (pipelineItemData) {
                        var handlerSetup = {
                            method: routeData.method,
                            path: routeData.path
                        };
                        if (pipelineItemData.staticsPath) {
                            handlerSetup.staticsPath = pipelineItemData.staticsPath;
                        } else {
                            handlerSetup.handler = _this2._resolveHandler(pipelineItemData.handler, pipelineItemData.params, routeData);
                        }
                        server.addRoute(routerData.name, handlerSetup);
                    });
                });
            });
        }
    }, {
        key: '_resolveSettings',
        value: function _resolveSettings(settings) {
            var _this3 = this;

            var VAR_CHAR = '$';
            var r = function r(value) {
                var fValue = value;
                if (typeof value == 'string') {
                    if (value[0] == VAR_CHAR) {
                        fValue = _this3.get(value.substring(1, value.length));
                    }
                } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
                    if (!Array.isArray(value)) {
                        Object.keys(value).forEach(function (k) {
                            value[k] = r(value[k]);
                        });
                    } else {
                        value = value.map(function (item) {
                            return r(item);
                        });
                    }
                }
                return fValue;
            };
            return r(settings);
        }
    }, {
        key: '_setupHTTPServers',
        value: function _setupHTTPServers() {
            var _this4 = this;

            var settings = this._resolveSettings(this.settings);
            settings.httpServers.forEach(function (httpServerData) {
                _this4._attachHTTPServer(httpServerData.name, httpServerData);
            });
        }
    }, {
        key: 'startHTTPServers',
        value: function startHTTPServers() {
            var _this5 = this;

            this._setupHTTPServers();
            return Promise.all(Object.keys(this.httpServersMap).map(function (serverName) {
                var buffServer = _this5.httpServersMap[serverName].server;
                return new Promise(function (resolve) {
                    buffServer.start(function (ports) {
                        resolve({
                            serverName: serverName,
                            ports: ports
                        });
                    });
                });
            }));
        }
    }, {
        key: 'startDaemons',
        value: function startDaemons() {}
    }]);

    return ProcessHandler;
}();