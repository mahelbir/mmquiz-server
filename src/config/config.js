import path from "path";
import {rootPath} from "../core/core.js";

const pathConfig = {root: rootPath()};
pathConfig.source = path.join(pathConfig.root, "src/");
pathConfig.storage = path.join(pathConfig.source, "storage/");
pathConfig.appStorage = path.join(pathConfig.storage, "app/");

export default {
    database: {
        dialect: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS
    },
    path: pathConfig,
    env: process.env
};