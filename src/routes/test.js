import {newRoute} from "../core/router.js";


const router = await newRoute("/test", []);

router.get("/{:param}", async (req, res) => {
    let data;

    return res.send("test " + req.params.param + " " + data);
});