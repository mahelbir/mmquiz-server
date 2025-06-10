import {DataTypes, Model, Op} from 'sequelize';
import {sequelize} from "../config/database.js";

class Selection extends Model {
    static findAllRandom(options = {}) {
        options.order = sequelize.random();
        return this.findAll(options);
    }

    static findPair(options) {
        options.limit = 2;
        return this.findAllRandom(options);
    }

    static async paginate(offset = 0, limit = 10, query = {}) {
        const where = query.where || {};
        const {rows, count} = await this.findAndCountAll({
            where,
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

Selection.init({
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
    name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    resourceUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'resource_url'
    }
}, {
    sequelize,
    tableName: "selections",
    charset: 'utf8'
});

export default Selection;
