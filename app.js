import path from "path";

import express from 'express';
import createError from 'http-errors';
import compression from 'compression';
import helmet from 'helmet';
import timeout from 'express-timeout-handler';
import {getVersion, serverIp} from 'melperjs/node';

import config from './src/config/config.js';
import scripter from './src/core/scripter.js';
import router from './src/core/router.js';
import packages from "./src/config/packages.js";
import {responseError, responseJSON} from "./src/middlewares/global-middleware.js";
import models from "./src/models/models.js";
import * as fs from "node:fs";


// system
const app = express();
app.use(timeout.handler({
    timeout: 120000,
    onTimeout: function (req, res) {
        return res.status(503).send('Request Timeout');
    }
}));
app.use("/static", express.static(config.path.static));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', parameterLimit: 5000000, extended: true}));
app.use((req, res, next) => {
    req.body = req.body || {};
    next();
});


// application
fs.mkdirSync(config.path.static, {recursive: true});
fs.mkdirSync(config.path.appStorage, {recursive: true});
await packages();
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.locals.VERSION = getVersion();
app.locals.SERVER_IP = serverIp();
app.locals.BASE_URL = config.env.BASE_URL;
app.set('trust proxy', true);
app.set('serverIp', app.locals.SERVER_IP);
app.set('version', app.locals.VERSION);
app.set('baseURL', app.locals.BASE_URL);
await models(app);
await scripter(app);
await router(app);
console.info("ENVIRONMENT: " + app.get('env'));
console.info("VERSION: " + app.get('version'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    try {
        const status = err.status || 500;
        const stack = req.app.get('env') === 'development' ? err.stack : '';
        return res
            .status(status)
            .send(responseJSON(status, err.message, stack));
    } catch {
        return res
            .status(500)
            .send(responseError("Internal Server Error", 500));
    }
});

// v1
export default app;