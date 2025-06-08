import {newRoute} from "../core/router.js";
import User from "../models/user.js";
import {hashBcrypt, verifyBcrypt} from "melperjs/node";
import config from "../config/config.js";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware.js";
import {time} from "melperjs";
import jwt from "jsonwebtoken";
import {getString} from "../config/packages.js";


const router = await newRoute("/auth", [basicAuthMiddleware]);

router.post("/login", async (req, res) => {
    const username = getString(req.body.username).replace(/[^a-zA-Z0-9]/g, "");
    const password = getString(req.body.password);

    if (!username || !password) {
        return res.responseError("Fill all required fields");
    }

    const user = await User.findOne({
        where: {username},
        attributes: ['id', 'username', 'password']
    });
    if (!user || !verifyBcrypt(password, user.password, config.env.SECRET_KEY)) {
        return res.responseError("Invalid username or password");
    }

    const payload = {
        id: user.id,
        username: user.username,
    };
    const token = jwt.sign(payload, config.env.SECRET_KEY, {expiresIn: '1d'});

    return res.responseSuccess({

        user: payload,
        token: token,
    }, "Login successful");
})

router.post("/register", async (req, res) => {
    const username = getString(req.body.username);
    const password = getString(req.body.password);
    const confirmPassword = getString(req.body.confirmPassword);

    if (!username || !password || !confirmPassword) {
        return res.responseError("Fill all required fields");
    }

    if (username.length < 3 || username.length > 20) {
        return res.responseError("Username must be between 3 and 20 characters");
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return res.responseError("Username can only contain letters and numbers");
    }

    if (password.length < 6 || password.length > 50) {
        return res.responseError("Password must be between 6 and 50 characters");
    }
    if (password !== confirmPassword) {
        return res.responseError("Passwords do not match");
    }

    const isUsernameExists = await User.findOne({
        where: {username},
        attributes: ['id']
    });
    if (isUsernameExists) {
        return res.responseError("Username already exists");
    }

    await User.create({
        username,
        password: hashBcrypt(password, config.env.SECRET_KEY),
        createdAt: time()
    });
    return res.responseSuccess(null, "User registered successfully");
});