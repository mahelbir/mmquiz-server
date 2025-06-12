import {newRoute} from "../core/router.js";
import jwtAuthMiddleware from "../middlewares/jwt-auth-middleware.js";
import User from "../models/user.js";
import {getString} from "../config/packages.js";
import {hashBcrypt, verifyBcrypt} from "melperjs/node";
import config from "../config/config.js";


const router = await newRoute("/profile", [jwtAuthMiddleware]);

router.post("/get", async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return res.responseError("User not found", 404);
    }
    return res.responseSuccess(getProfile(user));
});

router.post("/update", async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        return res.responseError("User not found", 404);
    }
    const currentPassword = getString(req.body.currentPassword);
    if (!currentPassword) {
        return res.responseError("Current password is required");
    }
    if (!verifyBcrypt(currentPassword, user.password, config.env.SECRET_KEY)) {
        return res.responseError("Current password is incorrect");
    }

    const username = getString(req.body.username);
    if (username) {
        if (username.length < 3 || username.length > 20) {
            return res.responseError("Username must be between 3 and 20 characters");
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            return res.responseError("Username can only contain letters and numbers");
        }
        user.username = username;
    }


    const newPassword = getString(req.body.newPassword);
    if (newPassword) {
        if (newPassword.length < 6 || newPassword.length > 20) {
            return res.responseError("Password must be between 6 and 20 characters");
        }
        const confirmPassword = getString(req.body.confirmPassword);
        if (confirmPassword !== newPassword) {
            return res.responseError("Passwords do not match");
        }
        user.password = hashBcrypt(newPassword, config.env.SECRET_KEY);
    }

    await user.save();
    return res.responseSuccess(getProfile(user));

});

function getProfile(user) {
    return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
    }
}