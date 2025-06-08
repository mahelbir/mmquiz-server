import {DataTypes, Model, Op} from 'sequelize';
import {sequelize} from "../config/database.js";

export const GameVisibility = Object.freeze({
    PRIVATE: 0,
    PUBLIC: 1,
    UNLISTED: 2
});

class Game extends Model {
    static async paginate(offset = 0, limit = 10, query = {}) {
        const where = {};
        if (query.search) {
            where[Op.or] = [
                {name: {[Op.like]: '%' + query.search + '%'}},
                {description: {[Op.like]: '%' + query.search + '%'}},
            ];
        }

        const {rows, count} = await Game.findAndCountAll({
            where: where,
            limit,
            offset,
            order: [['id', 'DESC']]
        });

        return {
            rows,
            count
        };
    }
}

Game.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
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