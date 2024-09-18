const Task = require("../models/Task_Schema");
const User = require("../models/User_Schema");
const jwt = require("jsonwebtoken");

const signups = (req, res) => {
  res.render("signup");
};

const loginpage = (req, res) => {
  res.render("login");
};
const Userpage = (req, res) => {
  res.render("User");
};
const Adminpage = (req, res) => {
  res.render("Admin");
};

const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  const users = await User.findOne({ email: email });
  if (users) {
    res.redirect("login");
  } else {
    let newUser = await User.create(req.body);

    res.cookie("role", newUser.role);
    res.cookie("id", newUser.id);

    res.redirect("login");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.send("user not found");
  } else if (user.password !== password) {
    return res.send("password not match");
  } else {
    let token = jwt.sign({ id: user._id }, "token");
    res.cookie("token", token).cookie("id", user._id).cookie("role", user.role);
    if(user.role=="Admin"){
        res.redirect("/user/Admin")
    }
    else{
        res.redirect("/user/User")
    }
  }
};

const updateAdminTask = async (req, res) => {
  let {title,des,category,_id} = req.body;

  let data = await Task.findByIdAndUpdate(_id , req.body);
  res.redirect("/user/Admin");
};


module.exports = { signups, signup, loginpage, login, Userpage , Adminpage  , updateAdminTask };
