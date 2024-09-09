const express = require("express");
var { rainbow } = require("handy-log");
require("dotenv").config();
const mongoose = require("mongoose");
const AdminRoutes = require("./admin-routes");
const SellerRoutes = require("./seller-routes");
const bodyParser = require("body-parser");
const createAdmin = require("./config/createAdmin");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
var cors = require("cors");
const WebsiteRoutes = require("./website-routes");
const { LoggedIn } = require("./middlewares/Adminauth");
const { SellerLoggedIn } = require("./middlewares/Sellerauth");

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

app.use(cors());
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

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: { secure: false }, // Set to `true` in production with HTTPS
    })
);

// Admin panel session
app.use(
    "/admin", // Apply session to /admin routes only
    session({
        name: "admin_sid",
        secret: process.env.ADMIN_SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: { secure: false }, // Set `true` in production with HTTPS
    })
);

// Seller panel session
app.use(
    "/seller", // Apply session to /seller routes only
    session({
        name: "seller_sid", // Alag cookie name
        secret: process.env.SELLER_SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: sessionStore,
        cookie: { secure: false }, // Set `true` in production with HTTPS
    })
);

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Use the middleware
app.use(LoggedIn);
app.use(SellerLoggedIn);

//routes
AdminRoutes(app);
SellerRoutes(app);
WebsiteRoutes(app);

module.exports = app;
