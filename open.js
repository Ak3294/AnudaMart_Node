const open = require("open");
require("dotenv").config();

setTimeout(() => {
    open(`http://localhost:${process.env.PORT}`);
}, 2000);
