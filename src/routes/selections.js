import {newRoute} from "../core/router.js";
import jwtAuthMiddleware from "../middlewares/jwt-auth-middleware.js";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware.js";
import {getString} from "../config/packages.js";
import {paginate, rowText} from "../utils/helper.js";
import Selection from "../models/selection.js";
import Game, {GameVisibility} from "../models/game.js";


const router = await newRoute("/selections");

router.post("/list", basicAuthMiddleware, async (req, res) => {
    const gameId = +req.body.gameId;
    if (isNaN(gameId) || gameId <= 0) {
        return res.responseError("Invalid game ID", 400);
    }

    const game = await Game.findByPk(gameId);
    if (!game) {
        return res.responseError("Game not found", 404);
    }
    if (game.visibility === GameVisibility.PRIVATE) {
        return res.responseError("You do not have permission for this game", 403);
    }

    const query = {
        where: {
            gameId: gameId
        },
        search: getString(req.body.search)
    };

    const result = await paginate(Selection, req.body.pageNumber, req.body.pageSize, req.body.buttonCount, query);
    return res.responseSuccess(result);
});

router.post("/list-all", jwtAuthMiddleware, async (req, res) => {
    const gameId = +req.body.gameId;
    if (isNaN(gameId) || gameId <= 0) {
        return res.responseError("Invalid game ID", 400);
    }

    const game = await Game.findOne({
        where: {
            id: gameId
        }
    });
    if (!game) {
        return res.responseError("Game not found", 404);
    }
    if (game.visibility === GameVisibility.PRIVATE) {
        const errorUserPermission = req.verifyUserPermission(game.userId);
        if (errorUserPermission) {
            return errorUserPermission;
        }
    }

    const selections = await Selection.findAll({
        where: {
            gameId: gameId
        },
        order: [['id', 'DESC']]
    });

    return res.responseSuccess(selections);
});

router.post("/get", jwtAuthMiddleware, async (req, res) => {
    const id = +req.body.id;
    if (isNaN(id) || id <= 0) {
        return res.responseError("Invalid selection ID", 400);
    }

    const row = await Selection.findByPk(id);
    if (!row) {
        return res.responseError("Selection not found", 404);
    }

    const game = await Game.findByPk(row.gameId);
    if (!game) {
        return res.responseError("Game not found", 404);
    }
    if (game.visibility === GameVisibility.PRIVATE) {
        const errorUserPermission = req.verifyUserPermission(game.userId);
        if (errorUserPermission) {
            return errorUserPermission;
        }
    }

    return res.responseSuccess(row);
});

router.post("/update", jwtAuthMiddleware, async (req, res) => {
    const id = +req.body.id;
    if (isNaN(id) || id <= 0) {
        return res.responseError("Invalid selection ID", 400);
    }
    const row = await Selection.findByPk(id);
    if (!row) {
        return res.responseError("Selection not found", 404);
    }

    const game = await Game.findByPk(row.gameId);
    if (!game) {
        return res.responseError("Game not found", 404);
    }

    const errorUserPermission = req.verifyUserPermission(game.userId);
    if (errorUserPermission) {
        return errorUserPermission;
    }

    try {
        validateSelectionFields(req, res, row);
    } catch (e) {
        return res.responseError(e.message, 400);
    }

    await row.save();
    return res.responseSuccess(row);
});

router.post("/create-bulk", jwtAuthMiddleware, async (req, res) => {
    const gameId = +req.body.gameId;
    if (isNaN(gameId) || gameId <= 0) {
        return res.responseError("Invalid game ID", 400);
    }

    const game = await Game.findByPk(gameId);
    if (!game) {
        return res.responseError("Game not found", 404);
    }
    const errorUserPermission = req.verifyUserPermission(game.userId);
    if (errorUserPermission) {
        return errorUserPermission;
    }

    const selections = req.body.selections;
    if (!Array.isArray(selections) || selections.length === 0) {
        return res.responseError("No selections provided", 400);
    }

    const errors = [];
    for (const row of selections) {
        try {
            validateSelectionFields(req, res, row);
            row.gameId = gameId;
        } catch (e) {
            const index  = selections.indexOf(row);
            errors.push(`Error in selection(${index}): ${e.message}`);
        }
    }
    if (errors.length > 0) {
        return res.responseError(errors, 400);
    }

    await Selection.bulkCreate(selections);

    return res.responseSuccess({game}, "Selections created successfully");
});

function validateSelectionFields(req, res, row) {
    row.name = rowText("name", row, req.body, 50, true);
    row.description = rowText("description", row, req.body, 100, true);
    row.resourceUrl = rowText("resourceUrl", row, req.body, 255, true);
    if (!row.name && !row.description && !row.resourceUrl) {
        throw Error("At least one of name, description or resource must be provided");
    }
}