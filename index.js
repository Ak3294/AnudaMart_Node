const app = require("./app");
const http = require("http");
const index = http.createServer(app);
const io = require("socket.io")(index);
const { rainbow } = require("handy-log");
require("dotenv").config();

const PORT = process.env.PORT;
const URL = process.env.URL;

io.on("connection", (socket) => {
    console.log("socket connected");
    socket.on("disconnect", function () {
        console.log("socket  disconnect!");
    });
    app.socket = socket;
});

// Listening to PORT 3000
// app.listen(PORT, () => {
//     setTimeout(printURL, 50);
//     rainbow(`App running on port ${PORT} ..`);
// });

app.listen(PORT, "0.0.0.0", () => {
    setTimeout(printURL, 50);
    rainbow(`App running on port ${PORT} ..`);
});

const printURL = () => {
    console.log("\x1b[36m%s\x1b[0m", `url: ${URL}:${PORT}`);
};
