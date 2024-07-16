const express = require("express");
const cors = require("cors");
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

// app configs.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use('/api', apiRouter);

//initialize the app.
async function initialize() {
    app.listen(PORT);
};

initialize()
    .finally(
        () => console.log(`app started on port:${PORT}`)
    );