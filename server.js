const express = require("express");
const path=require("path")
const ejs = require("ejs")
const chatRouter = require("./routes/chat-route");
const roomRouter = require("./routes/room-route")
const mongoose = require("mongoose");
const http = require("http");
const socketIO=require("socket.io");

//establish DB connection
mongoose.connect("mongodb+srv://m001-student:m001-mongodb-basics@sandbox.lyqvg.mongodb.net/chat-app?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const DB = mongoose.connection;
    
DB.on("error", () => {
    console.log("error when connecting to DB");
});

DB.once("open", () => {
    console.log("Connected to DB");
})

const app = express();

const server = http.createServer(app);
const io = socketIO(server);


app.set("view engine", "ejs");
app.set("io", io);
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


app.use("/room", roomRouter);
app.use("/chat", chatRouter);






app.get("/", (req, res) => {
    res.render("login", {
        usernameError: "",
        codeError: "",
        message: ""
    })
})




server.listen(process.env.PORT||5000, () => {
    console.log("sever running")
})