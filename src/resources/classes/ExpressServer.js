// var q = require('q');
// var mongodb = require('mongodb');
// var underscore = require('underscore');
// var JSONSchema = require('jsonschema');
// var validateJSONSchema = JSONSchema.validate;
// var ObjectID = mongodb.ObjectID;
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import http from 'http';
import fs from 'fs';
import path from 'path';
import q from 'q';

export class ExpressServer {
    
    constructor () {
        this.app = express();
        this.app.use(compression());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(cookieParser());
        this.app.disable('x-powered-by');
        this.app.use(function (req, res, next) {
            req.startTimestamp = Date.now();
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            if ('OPTIONS' == req.method) res.status(200).send('OK');
            else next();
        });
        this.httpServer = http.Server(this.app);
        this.routersMap = {};
    }

    addRouter (name, pth) {
        this.routersMap[name] = express.Router();
        this.app.use(pth, this.routersMap[name]);
    }

    addRoute (routerName, routeData) {
        // Statics handler
        if (routeData.staticsPath) {
            this.routersMap[routerName].use(
                routeData.path, express.static(routeData.staticsPath)
            );
        }
        // Regular handler
        else {
            this.routersMap[routerName][
                routeData.method.toLowerCase()
            ](routeData.path, routeData.handler);
        }
    }

    startHTTPServer (httpPort) {
        var deferred = q.defer();
        this.httpServer.listen(httpPort, () => {
            deferred.resolve();
        });
        return deferred.promise;
    }
    
    start (httpPort, httpsPort) {
        var deferred = q.defer();
        this.startHTTPServer(httpPort).then(() => {
            deferred.resolve();
        });
        return deferred.promise;
    }

}