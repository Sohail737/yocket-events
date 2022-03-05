const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const initializeDBConnection = require('./db/db.connect');
const events=require("./routes/events.route");
const errorHandler=require("./middlewares/error-handler.middleware");

const app = express();

app.use(bodyParser.json());

app.use(cors());

const PORT = 3000;


initializeDBConnection();



app.use("/events",events)

app.use(errorHandler);


app.listen(PORT, () => {
    console.log('server started on port', PORT);
});