const { Router } = require("express");
const { signups, loginpage, signup, login, Userpage, Adminpage, updateAdminTask } = require("../controllers/User_controller");
const { authorize, Auth } = require("../middleware/Auth");

const Route = Router();

Route.get("/signup",signups)
Route.post("/signup",signup)
Route.get("/login",loginpage)
Route.post("/login",login)
Route.get("/User",Auth,Userpage)
Route.get("/Admin",authorize,Auth,Adminpage)

Route.post("/updateAdminTask",updateAdminTask);

module.exports = Route;

