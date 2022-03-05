const sequelize = require("./db.config");


const initializeDBConnection = async () => {
    try {
        
        await sequelize.authenticate();

        console.log("successfully connected");
    } catch (err) {
        console.error("sql connection failed...", err);
    }

}

module.exports = initializeDBConnection 