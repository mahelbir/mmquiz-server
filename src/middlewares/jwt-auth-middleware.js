import jwt from "jsonwebtoken";
import config from "../config/config.js";

export default async (req, res, next) => {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.responseError("Unauthorized", 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.responseError("Unauthorized", 401);
    }

    try {
        req.user = jwt.verify(token, config.env.SECRET_KEY);
        return next();
    } catch (err) {
        return res.responseError("Unauthorized", 401);
    }
}