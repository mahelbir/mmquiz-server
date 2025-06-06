import {newRoute} from "../core/router.js";
import jwtAuthMiddleware from "../middlewares/jwt-auth-middleware.js";


const router = await newRoute("/games", [jwtAuthMiddleware]);

router.post("/", async (req, res) => {
    return res.responseSuccess(req.user);
});