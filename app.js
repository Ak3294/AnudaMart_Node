const express = require("express");
var { rainbow } = require("handy-log");
require("dotenv").config();
const mongoose = require("mongoose");
const AdminRoutes = require("./admin-routes");
const bodyParser = require("body-parser");
const createAdmin = require("./config/createAdmin");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const WebsiteRoutes = require("./website-routes");

// create admin
const result = createAdmin();
if (!result) {
    print("admin creation failed");
    process.exit();
}

//express and env config
const app = express(),
    {
        env: { DB_CONNECT, PORT },
    } = process;

// set the view engine to ejs
app.set("view engine", "ejs");

// public directory
app.use(express.static(__dirname + "/public"));

//mongodb connection
mongoose.connect(DB_CONNECT, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
mongoose.connection.on("connected", () => {
    console.log("Connected to mongo instance");
});
mongoose.connection.on("error", (err) => {
    console.error("Error connecting to mongo", err);
});

sessionStore = new MongoStore({
    url: DB_CONNECT,
});

// Use the session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: {
            maxAge: 14 * 24 * 60 * 60, // = 14 days. Default
        },
    })
);

//middleware
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

//routes
AdminRoutes(app);
WebsiteRoutes(app);

module.exports = app;
