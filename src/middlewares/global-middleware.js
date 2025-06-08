import config from "../config/config.js";
import {castArray} from "lodash-es";

export default (req, res, next) => {

    req.timezone = config.env.TIMEZONE;
    if (req.headers.accept) {
        req.acceptJSON = req.headers.accept.includes("application/json");
    }
    res.responseSuccess = (data = null, message = null, statusCode = 200) => {
        return res.status(statusCode).send(responseSuccess(data, message, statusCode));
    }
    res.responseError = (message = null, statusCode = 400) => {
        return res.status(statusCode).send(responseError(message, statusCode));
    }
    res.responseJSON = (statusCode, messages = [], data = null) => {
        return res.status(statusCode).send(responseJSON(statusCode, messages, data));
    }
    req.hasUserPermission = (userId) => {
        if (!req.user || !userId) {
            return false;
        }
        return req.user?.id === userId;
    }
    req.verifyUserPermission = (userId) => {
        if (!req.hasUserPermission(userId)) {
            return res.responseError("You do not have permission to access this resource", 403);
        }
    }

    return next();
}

export function responseJSON(statusCode, messages = [], data = null) {
    return {
        statusCode: statusCode,
        isSuccess: statusCode <= 299 && statusCode >= 200,
        messages: castArray(messages),
        data: data
    };
}

export function responseError(message = null, statusCode = 400) {
    message = message || ["Error"];
    return responseJSON(statusCode, message);
}

export function responseSuccess(data = null, message = null, statusCode = 200) {
    message = message || ["Success"];
    return responseJSON(statusCode, message, data);
}