import {DataTypes, Model} from 'sequelize';
import {sequelize} from "../config/database.js";

class User extends Model {
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    createdAt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'created_at'
    }
}, {
    sequelize,
    tableName: "users",
    charset: 'utf8'
});

export default User;
