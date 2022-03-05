const { DataTypes } = require("sequelize");
const sequelize=require("../db/db.config");

const Event = sequelize.define("event", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Event.sync();


module.exports = Event