import {DataTypes, Model} from 'sequelize';
import {sequelize} from "../config/database.js";

const GameVisibility = Object.freeze({
    PRIVATE: 0,
    PUBLIC: 1,
    UNLISTED: 2
});

class Game extends Model {
}

Game.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(400),
        allowNull: true
    },
    coverUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'cover_url'
    },
    visibility: {
        type: DataTypes.ENUM,
        values: Object.values(GameVisibility),
        allowNull: false,
        defaultValue: GameVisibility.PUBLIC,
    },
    isNsfw: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_nsfw'
    },
}, {
    sequelize,
    tableName: "games",
    charset: 'utf8'
});

export default Game;