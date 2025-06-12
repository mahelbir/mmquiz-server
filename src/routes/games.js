import {newRoute} from "../core/router.js";
import jwtAuthMiddleware from "../middlewares/jwt-auth-middleware.js";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware.js";
import {getString} from "../config/packages.js";
import {paginate, rowText} from "../utils/helper.js";
import Game, {GameVisibility} from "../models/game.js";
import Selection from "../models/selection.js";


const router = await newRoute("/games");

router.post("/list", basicAuthMiddleware, async (req, res) => {
    const paginationQuery = {
        where: {
            visibility: GameVisibility.PUBLIC
        },
        search: getString(req.body.search)
    };
    return await paginateGames(req, res, paginationQuery);
});

router.post("/list-my", jwtAuthMiddleware, async (req, res) => {
    const paginationQuery = {
        where: {
            userId: req.user.id
        },
        search: getString(req.body.search)
    };
    return await paginateGames(req, res, paginationQuery);
});

router.post("/get", basicAuthMiddleware, async (req, res) => {
    const id = +req.body.id;
    const row = await Game.findByPk(id);
    if (!row) {
        return res.responseError("Game not found", 404);
    }
    if (row.visibility === GameVisibility.PRIVATE) {
        return res.responseError("You do not have permission for this game", 403);
    }
    return res.responseSuccess(row);
});

router.post("/get-my", jwtAuthMiddleware, async (req, res) => {
    const id = +req.body.id;
    const game = await Game.findOne({
        where: {
            id: id
        }
    });
    if (!game) {
        return res.responseError("Game not found", 404);
    }
    const errorUserPermission = req.verifyUserPermission(game.userId);
    if (errorUserPermission) {
        return errorUserPermission;
    }
    return res.responseSuccess(game);
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
    const errorUserPermission = req.verifyUserPermission(row.userId);
    if (errorUserPermission) {
        return errorUserPermission;
    }
    const errorGameFields = validateGameFields(req, res, row);
    if (errorGameFields) {
        return errorGameFields;
    }
    await row.save();
    return res.responseSuccess(row);
});

router.post("/create", jwtAuthMiddleware, async (req, res) => {
    const row = {
        userId: req.user.id,
    };
    const errorGameFields = validateGameFields(req, res, row);
    if (errorGameFields) {
        return errorGameFields;
    }
    const game = await Game.create(row);
    return res.responseSuccess(game);
});

async function paginateGames(req, res, paginationQuery) {
    paginationQuery.where = paginationQuery.where || {};
    const includeNsfw = req.body.includeNsfw !== false;
    if (!includeNsfw) {
        paginationQuery.where.isNsfw = false;
    }
    if (req.body.hasOwnProperty("visibility") && Object.values(GameVisibility).includes(+req.body.visibility)) {
        paginationQuery.where.visibility = +req.body.visibility;
    }
    const result = await paginate(Game, req.body.pageNumber, req.body.pageSize, req.body.buttonCount, paginationQuery);
    for (let i = 0; i < result.items.length; i++) {
        const item = await result.items[i];
        item.dataValues.totalSelectionCount = await Selection.count({
            where: {
                gameId: item.id
            }
        });
    }
    return res.responseSuccess(result);
}

function validateGameFields(req, res, row) {
    try {
        row.name = rowText("name", row, req.body, 255, false);
        row.description = rowText("description", row, req.body, 400, true);
        row.coverUrl = rowText("coverUrl", row, req.body, 255, true);
        if (req.body.hasOwnProperty("visibility") && Object.values(GameVisibility).includes(+req.body.visibility)) {
            row.visibility = +req.body.visibility;
        }
        if (req.body.hasOwnProperty("isNsfw") && typeof req.body.isNsfw === "boolean") {
            row.isNsfw = req.body.isNsfw;
        }
    } catch (e) {
        return res.responseError(e.message, 400);
    }
}