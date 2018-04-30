'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ExpressServer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // var q = require('q');
// var mongodb = require('mongodb');
// var underscore = require('underscore');
// var JSONSchema = require('jsonschema');
// var validateJSONSchema = JSONSchema.validate;
// var ObjectID = mongodb.ObjectID;


var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ExpressServer = exports.ExpressServer = function () {
    function ExpressServer() {
        _classCallCheck(this, ExpressServer);

        this.app = (0, _express2.default)();
        this.app.use((0, _compression2.default)());
        this.app.use(_bodyParser2.default.urlencoded({ extended: false }));
        this.app.use(_bodyParser2.default.json());
        this.app.use((0, _cookieParser2.default)());
        this.app.disable('x-powered-by');
        this.app.use((0, _morgan2.default)('dev'));
        this.app.use(function (req, res, next) {
            req.startTimestamp = Date.now();
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            if ('OPTIONS' == req.method) res.status(200).send('OK');else next();
        });
        this.httpServer = _http2.default.Server(this.app);
        this.routersMap = {};
    }

    _createClass(ExpressServer, [{
        key: 'addRouter',
        value: function addRouter(name, pth) {
            this.routersMap[name] = _express2.default.Router();
            this.app.use(pth, this.routersMap[name]);
        }
    }, {
        key: 'addRoute',
        value: function addRoute(routerName, routeData) {
            // Statics handler
            if (routeData.staticsPath) {
                this.routersMap[routerName].use(routeData.path, _express2.default.static(routeData.staticsPath));
            }
            // Regular handler
            else {
                    this.routersMap[routerName][routeData.method.toLowerCase()](routeData.path, routeData.handler);
                }
        }
    }, {
        key: 'startHTTPServer',
        value: function startHTTPServer(httpPort) {
            var deferred = _q2.default.defer();
            this.httpServer.listen(httpPort, function () {
                deferred.resolve();
            });
            return deferred.promise;
        }
    }, {
        key: 'start',
        value: function start(httpPort, httpsPort) {
            var deferred = _q2.default.defer();
            this.startHTTPServer(httpPort).then(function () {
                deferred.resolve();
            });
            return deferred.promise;
        }
    }]);

    return ExpressServer;
}();