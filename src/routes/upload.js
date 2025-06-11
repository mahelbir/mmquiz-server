import {newRoute} from "../core/router.js";
import jwtAuthMiddleware from "../middlewares/jwt-auth-middleware.js";
import {tokenUuid} from "melperjs/node";
import path from "path";
import config from "../config/config.js";
import fsp from "fs/promises";


const router = await newRoute("/upload", [jwtAuthMiddleware]);

router.post("/image", async (req, res) => {
    const imageBase64 = req.body.imageData;
    if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.responseError("Image data is required");
    }
    if (!/^[A-Za-z0-9+/=]+$/.test(imageBase64)) {
        return res.responseError("Invalid image data");
    }

    const buffer = Buffer.from(imageBase64, "base64");
    if (buffer.length > 2097152) {
        return res.responseError("Image size exceeds 2MB limit");
    }

    const fileName = tokenUuid() + ".jpg";
    const filePath = path.join(config.path.static, fileName);
    try {
        await fsp.writeFile(filePath, buffer);
        const fileUri = "/static/" + fileName;
        return res.responseSuccess({
                message: "Image uploaded successfully",
                filePath: fileUri,
                fileUrl: config.env.BASE_URL + fileUri,
            }
        );
    } catch (e) {
        return res.responseError(e.message, 500);
    }
});