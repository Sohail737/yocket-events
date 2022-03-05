const { Sequelize } = require("sequelize");
require('dotenv').config();

const dbName=process.env.DB_NAME;
const dbHost=process.env.DB_HOST;
const dbUserName=process.env.DB_USER;
const dbPassword=process.env.DB_PASSWORD;

const sequelize = new Sequelize(dbName, dbUserName, dbPassword, {
    host: dbHost,
    dialect: 'mysql'
})

module.exports=sequelize;