const review = require("../models/comment");
const Task = require("../models/Task_Schema");

const Addtask = (req, res) => {
  res.render("AddTask");
};

const Tasks = async (req, res) => {
  let { title, des, category } = req.body;
  const data = await Task.create(req.body);
  req.io.emit("taskcreated", data);
  res.redirect("/user/User")
};

const DisplayTask = async (req, res) => {
  let data = await Task.find({ userID: req.body.userID });
  console.log(data);

  res.json(data);
};

// delte Task
const deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  let data = await Task.find({ userID: req.body.userID });
  req.io.emit("taskcreated", req.params.id);
  res.redirect("/user/User");
};

//admin task display

const AdminTaskDisplay = async (req, res) => {
    let data = await Task.find();
    console.log(data);
  
    res.json(data);
  };


// update task

const updateTask = async (req, res) => {
    let {title,des,category,_id} = req.body;

    let data = await Task.findByIdAndUpdate(_id , req.body);
    req.io.emit("taskcreated", data);
    res.redirect("/user/User");
};




// SEARCH TASK

  const searchTasks = async (req, res) => {
    const { category } = req.query;
    try {
        let data;
        if (category) {
            
            data = await Task.find({ category: { $regex: new RegExp(category, "i") } });
        } else {
            data = await Task.find(); 
        }
        res.json(data);  
    } catch (error) {
        res.status(500).json({ error: "Error fetching tasks" });
    }
};


const singletask= async (req, res) => {
  let { id } = req.params

  let singleTask = await Task.findById(id).populate({ path : "reviews" , populate : { path : "author"} });
  res.render("singletask", { singleTask })
}

const home = async (req, res) => {
  res.render("home");
}


// comment

const reviews = async (req, res) => {

  let listing = await Task.findById(req.params.id);

  let newReview = new review(req.body.review);
  
  newReview.author = req.body.userID;
  // console.log(newReview);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/product/singleTask/${req.params.id}`);
  console.log(listing);
};




module.exports = { Addtask, Tasks, DisplayTask, deleteTask , AdminTaskDisplay , searchTasks , updateTask , singletask , home , reviews};
