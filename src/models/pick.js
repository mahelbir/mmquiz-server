import {DataTypes, Model} from 'sequelize';
import {sequelize} from "../config/database.js";

class Pick extends Model {
    static findAllRandom(options = {}) {
        options.order = sequelize.random();
        return this.findAll(options);
    }

    static findPair(options) {
        options.limit = 2;
        return this.findAllRandom(options);
    }
}

Pick.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tournamentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tournament_id'
    },
    selectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'selection_id'
    },
    roundsOf: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'rounds_of'
    },
    isPicked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_picked'
    },
}, {
    sequelize,
    tableName: "picks",
    charset: 'utf8'
});

export default Pick;
