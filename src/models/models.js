import {sequelize} from "../config/database.js";
import {QueryTypes} from "sequelize";
import Tournament from "./tournament.js";
import Game from "./game.js";
import Selection from "./selection.js";
import Pick from "./pick.js";
import User from "./user.js";

sequelize.authenticate().then(async () => {
    const result = await sequelize.query('SELECT VERSION() AS version', {
        type: QueryTypes.SELECT
    });
    console.info('Database:', (result?.[0].version ?? "Unknown"));
}).catch((e) => {
    console.error('Unable to connect to the database: ', e.message);
});


export default (app) => {
    Tournament.belongsTo(Game, {
        foreignKey: 'gameId',
        as: 'game'
    });
    Game.hasMany(Tournament, {
        foreignKey: 'gameId',
        as: 'tournaments'
    });
    Selection.belongsTo(Game, {
        foreignKey: 'gameId',
        as: 'game'
    });
    Game.hasMany(Selection, {
        foreignKey: 'gameId',
        as: 'selections'
    });
    Game.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    User.hasMany(Game, {
        foreignKey: 'userId',
        as: 'games'
    });
    Pick.belongsTo(Tournament, {
        foreignKey: 'tournamentId',
        as: 'tournament'
    });
    Tournament.hasMany(Pick, {
        foreignKey: 'tournamentId',
        as: 'picks'
    });
    Pick.belongsTo(Selection, {
        foreignKey: 'selectionId',
        as: 'selection'
    });
};