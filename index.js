const express = require("express");
const connect = require("./config/db");
const cookies = require("cookie-parser");
const Route = require("./routes/user_route");
const TaskRoute = require("./routes/task_route");

const http = require("http");
const socketio = require("socket.io");

require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookies());

const server = http.createServer(app);
const io = socketio(server);


app.use((req, res, next) => {
  req.io = io;
  next();
});


app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

app.use("/user", Route);
app.use("/product", TaskRoute);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});

app.get("/", (req, res) => {
    res.redirect("/user/signup");
  });

app.listen(process.env.PORT, () => {
  connect();
  console.log(`listening on port ${process.env.PORT}`);
});
