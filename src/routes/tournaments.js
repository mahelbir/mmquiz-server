import {newRoute} from "../core/router.js";
import Tournament from "../models/tournament.js";
import basicAuthMiddleware from "../middlewares/basic-auth-middleware.js";
import Selection from "../models/selection.js";
import Pick from "../models/pick.js";
import {Op} from "sequelize";
import {sequelize} from "../config/database.js";
import Game, {GameVisibility} from "../models/game.js";
import {time} from "melperjs";


const router = await newRoute("/tournaments", [basicAuthMiddleware]);

router.post("/start", async (req, res) => {
    const gameId = Math.max(+req.body.gameId, 0);
    const roundsOf = +req.body.roundsOf;

    if (!roundsOf || roundsOf < 2 || (roundsOf & (roundsOf - 1)) !== 0) {
        return res.responseError("Invalid rounds");
    }

    if (!gameId) {
        return res.responseError("Invalid game")
    }
    const game = await Game.findByPk(gameId);
    if (!game) {
        return res.responseError("Game not found");
    }
    if (game.visibility === GameVisibility.PRIVATE) {
        return res.responseError("Game is not available");
    }

    const totalSelectionCount = await Selection.count({where: {gameId}});
    if (totalSelectionCount < roundsOf) {
        return res.responseError("Not enough selections for the tournament");
    }

    const selections = await Selection.findPair({
        where: {gameId}
    });

    const tournament = await Tournament.create({
        gameId: gameId,
        roundsOf: roundsOf,
        currentRoundsOf: roundsOf,
        createdAt: time()
    });

    return res.responseSuccess({
        game,
        tournament,
        selections,
    });
});

router.post("/pick", async (req, res) => {
    const tournamentId = Math.max(+req.body.tournamentId, 0);
    const pickedId = Math.max(+req.body.pickedId, 0);
    const droppedId = Math.max(+req.body.droppedId, 0);

    if (!tournamentId || !pickedId || !droppedId) {
        return res.responseError("Invalid tournament or selections");
    }

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
        return res.responseError("Tournament not found");
    }

    const isTournamentFinished = () => tournament.currentRoundsOf <= 1;
    if (isTournamentFinished()) {
        return res.responseError("Tournament is already finished");
    }

    const transaction = await sequelize.transaction();
    try {
        const updatePick = async (pickId, isPicked) => {
            let pick = await Pick.findOne({
                where: {
                    tournamentId: tournament.id,
                    selectionId: pickId
                },
                transaction
            });
            if (!pick) {
                pick = await Pick.create({
                    tournamentId: tournament.id,
                    selectionId: pickId,
                    roundsOf: tournament.currentRoundsOf,
                    isPicked: isPicked
                }, {transaction});
            } else {
                pick.isPicked = isPicked;
                pick.roundsOf = tournament.currentRoundsOf;
                await pick.save({transaction});
            }
            return pick;
        }
        await updatePick(pickedId, true);
        await updatePick(droppedId, false);
        const tournamentPicks = await Pick.findAll({
            where: {
                tournamentId: tournament.id,
                roundsOf: tournament.currentRoundsOf
            },
            attributes: ['selectionId'],
            transaction
        });

        const isRoundFinished = tournamentPicks.length >= tournament.currentRoundsOf;
        if (isRoundFinished) {
            tournament.currentRoundsOf /= 2;
        }
        const isNewTournament = tournament.currentRoundsOf === tournament.roundsOf;
        await tournament.save({transaction});

        let selections = [];
        if (isNewTournament) {
            selections = await Selection.findPair({
                where: {
                    gameId: tournament.gameId,
                    id: {
                        [Op.notIn]: tournamentPicks.map(p => p.selectionId)
                    }
                }
            });
        } else if (isTournamentFinished()) {
            await transaction.commit();
            const winnerSelection = await Selection.findByPk(pickedId);
            return res.responseSuccess({
                isRoundFinished,
                isTournamentFinished: true,
                winnerSelection
            }, "Tournament is finished");
        } else {
            const previousPicks = await Pick.findPair({
                where: {
                    tournamentId: tournament.id,
                    roundsOf: tournament.currentRoundsOf * 2,
                    isPicked: true,
                },
                attributes: ['selectionId'],
                transaction
            });
            selections = await Selection.findAll({
                where: {
                    id: {
                        [Op.in]: previousPicks.map(p => p.selectionId)
                    }
                }
            });
        }

        if (selections.length < 2) {
            await transaction.rollback();
            return res.responseError("Not enough selections for the game");
        }

        await transaction.commit();
        return res.responseSuccess({
            isRoundFinished,
            isTournamentFinished: false,
            tournament: {
                id: tournament.id,
                currentRoundsOf: tournament.currentRoundsOf,
                roundsOf: tournament.roundsOf,
            },
            selections: selections
        })
    } catch (e) {
        await transaction.rollback();
        return res.responseError(e.message);
    }
});