import {newRoute} from "../core/router.js";


const router = await newRoute("/");

router.get("/", async (req, res) => {
    return res.responseSuccess();
});