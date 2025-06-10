import {newRoute} from "../core/router.js";
import jwtAuthMiddleware from "../middlewares/jwt-auth-middleware.js";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware.js";
import {getString} from "../config/packages.js";
import {paginate, rowText} from "../utils/helper.js";
import Game, {GameVisibility} from "../models/game.js";
import Selection from "../models/selection.js";


const router = await newRoute("/games");

router.post("/list", basicAuthMiddleware, async (req, res) => {
    const includeNsfw = req.body.includeNsfw !== false;
    const query = {
        where: {
            visibility: GameVisibility.PUBLIC
        },
        search: getString(req.body.search)
    };
    if (!includeNsfw) {
        query.where.isNsfw = false;
    }
    const result = await paginate(Game, req.body.pageNumber, req.body.pageSize, req.body.buttonCount, query);
    for (let i = 0; i < result.items.length; i++) {
        const item = await result.items[i];
        item.dataValues.totalSelectionCount = await Selection.count({
            where: {
                gameId: item.id
            }
        });
    }
    return res.responseSuccess(result);
});

router.post("/get", basicAuthMiddleware, async (req, res) => {
    const id = +req.body.id;
    const row = await Game.findByPk(id);
    if (!row) {
        return res.responseError("Game not found", 404);
    }
    return res.responseSuccess(row);
});

router.post("/update", jwtAuthMiddleware, async (req, res) => {
    const id = +req.body.id;
    if (isNaN(id) || id <= 0) {
        return res.responseError("Invalid game ID", 400);
    }
    const row = await Game.findByPk(id);
    if (!row) {
        return res.responseError("Game not found", 404);
    }
    const noPermission = req.verifyUserPermission(row.userId);
    if (noPermission) {
        return noPermission;
    }
    try {
        validateGame(row, req);
    } catch (e) {
        return res.responseError(e.message, 400);
    }
    await row.save();
    return res.responseSuccess(row);
});

router.post("/create", jwtAuthMiddleware, async (req, res) => {
    const row = {
        userId: req.user.id,
    };
    try {
        validateGame(row, req);
    } catch (e) {
        return res.responseError(e.message, 400);
    }
    await Game.create(row);
    return res.responseSuccess(row);
});

function validateGame(row, req) {
    row.name = rowText("name", row, req.body, 255, false);
    row.description = rowText("description", row, req.body, 400, true);
    row.coverUrl = rowText("coverUrl", row, req.body, 255, true);
    if (req.body.hasOwnProperty("visibility") && Object.values(GameVisibility).includes(+req.body.visibility)) {
        row.visibility = +req.body.visibility;
    }
    if (req.body.hasOwnProperty("isNsfw") && typeof req.body.isNsfw === "boolean") {
        row.isNsfw = req.body.isNsfw;
    }
    return row;
}