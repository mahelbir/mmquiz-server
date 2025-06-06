import {Server} from "socket.io";

import config from "../config/config.js";
import {sha256} from "melperjs/node";


let io = null;

export default {
    init(server) {
        const socketAuth = sha256("socket" + config.env.SECRET_KEY + new Date().getUTCDay());
        io = new Server(server, {
            cors: {
                origin: [config.env.BASE_URL],
                methods: ["GET"]
            }
        });
        io.use((socket, next) => {
            if (socket.handshake.headers['x-auth'] === socketAuth)
                return next();
            next(new Error('not authorized'));
        }).on('connection', (socket) => {
        });
        return socketAuth;
    },
    get() {
        return io;
    }
}