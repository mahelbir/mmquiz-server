import {DataTypes, Model} from 'sequelize';
import {sequelize} from "../config/database.js";

class Tournament extends Model {
}

Tournament.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'game_id'
    },
    roundsOf: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rounds_of'
    },
    currentRoundsOf: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'current_rounds_of'
    },
    createdAt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_at'
    },
}, {
    sequelize,
    tableName: "tournaments",
    charset: 'utf8'
});

export default Tournament;
