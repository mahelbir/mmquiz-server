import {Sequelize} from "sequelize";
import config from "./config.js";

const options = {
    dialect: "postgres",
    host: config.database.host,
    port: parseInt(config.database.port),
    timezone: config.env.UTC,
    logging: false,
    define: {
        underscored: true,
        timestamps: false
    },
    pool: {
        min: 1,
        max: 10,
        acquire: 180000,
        idle: 30000,
        evict: 30000
    },
    dialectOptions: {
        connectTimeout: 90000,
        statement_timeout: 180000,
        idle_in_transaction_session_timeout: 180000,
        application_name: 'nodeapp' + config.env.PORT,
    },
    retry: {
        max: 3,
        match: [/deadlock/i, /timeout/i]
    },
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
};

if (config.env.NODE_ENV === 'production') {
    options.pool = {
        min: 200,
        max: 2000,
        acquire: 60000,
        idle: 30000,
        evict: 30000
    };
    console.info("Database pool set to production mode");
}

export const sequelize = new Sequelize(config.database.name, config.database.user, config.database.pass, options);

