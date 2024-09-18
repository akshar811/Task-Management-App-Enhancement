const { Router } = require("express");
const { Addtask, Tasks, DisplayTask, deleteTask, AdminTaskDisplay, searchTasks, updateTask, singletask, home, reviews } = require("../controllers/Task_controller");
const { Auth } = require("../middleware/Auth");

const TaskRoute = Router();

TaskRoute.get("/Addtask",Auth,Addtask);
TaskRoute.post("/Addtasks",Auth,Tasks);
TaskRoute.get("/DisplayTask",Auth,DisplayTask);
TaskRoute.delete("/DeleteTask/:id",deleteTask);
TaskRoute.get("/AdminTaskDisplay",AdminTaskDisplay);
TaskRoute.get("/searchTasks",searchTasks);
TaskRoute.post("/updateTask",updateTask);
TaskRoute.get("/singleTask/:id",singletask);
TaskRoute.get("/Home",home);

TaskRoute.post("/:id/comment",Auth ,reviews);

module.exports = TaskRoute;