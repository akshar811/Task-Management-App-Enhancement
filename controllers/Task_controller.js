const fs = require("fs");
const csvParser = require("csv-parser");
const { Parser } = require("json2csv");
const multer = require("multer");
const path = require("path");

const review = require("../models/comment");
const Task = require("../models/Task_Schema");
const User = require("../models/User_Schema");

const Addtask = async (req, res) => {
  res.render("AddTask");
};

const Tasks = async (req, res) => {
  try {
    const { title, des, category, duedate, assignedTo , status , priority} = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Task title cannot be empty." });
    }

    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res
        .status(400)
        .json({ message: "Task with this title already exists." });
    }

    const currentDate = new Date();
    const taskDueDate = new Date(duedate);
    if (taskDueDate < currentDate) {
      return res
        .status(400)
        .json({ message: "Due date cannot be in the past." });
    }

    const taskData = {
      title,
      des,
      category,
      duedate,
      assignedTo, 
      status,
      priority,
    };

    const newTask = await Task.create(taskData);
    req.io.emit("taskcreated", newTask);
    res.redirect("/user/User");
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
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
  let { title, des, category, _id } = req.body;

  let data = await Task.findByIdAndUpdate(_id, req.body);
  req.io.emit("taskcreated", data);
  res.redirect("/user/User");
};

// SEARCH TASK

const searchTasks = async (req, res) => {
  const { category } = req.query;
  try {
    let data;
    if (category) {
      data = await Task.find({
        category: { $regex: new RegExp(category, "i") },
      });
    } else {
      data = await Task.find();
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
};

const singletask = async (req, res) => {
  let { id } = req.params;

  let singleTask = await Task.findById(id).populate({
    path: "reviews",
    populate: { path: "author" },
  });
  res.render("singletask", { singleTask });
};

const home = async (req, res) => {
  res.render("home");
};

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

// pagination
const getTasksWithPagination = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const tasks = await Task.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Task.countDocuments();

    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
};

// filter

const getTasks = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    assignedTo,
    dueDateSort,
  } = req.query;
  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;

  console.log(query);

  const sortOptions = dueDateSort
    ? { duedate: dueDateSort === "asc" ? 1 : -1 }
    : {};

  try {
    const tasks = await Task.find(query)
      .populate("userID", "assignedTo")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    console.log(query);
    console.log(tasks);

    const totalTasks = await Task.countDocuments(query);
    console.log(totalTasks);
    res.json({
      tasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

// multer

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv") {
      return cb(new Error("Only CSV files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Export tasks to CSV

const exportTasksToCSV = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo");

    const fields = [
      "title",
      "des",
      "category",
      "duedate",
      "assignedTo.username",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(tasks);

    res.header("Content-Type", "text/csv");
    res.attachment("tasks.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting tasks to CSV:", error);
    res.status(500).send("Error exporting tasks to CSV");
  }
};

// Import tasks from CSV

const importTasksFromCSV = async (req, res) => {
  try {
    const tasks = [];
    const users = await User.find(); // Pre-fetch all users to validate 'assignedTo' field

    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        // Validate the task data format
        if (!row.title || !row.des || !row.duedate || !row.assignedTo) {
          throw new Error("Missing required fields in CSV row");
        }

        // Validate assigned user exists
        const assignedUser = users.find((user) => user.name === row.assignedTo);
        if (!assignedUser) {
          throw new Error(`Assigned user ${row.assignedTo} not found`);
        }

        // Push the valid task data into the array
        tasks.push({
          title: row.title,
          des: row.des,
          category: row.category,
          duedate: new Date(row.duedate),
        });
      })
      .on("end", async () => {
        // Insert the valid tasks in bulk
        await Task.insertMany(tasks);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path); 

        res.status(200).send("Tasks imported successfully");
      });
  } catch (error) {
    console.error("Error importing tasks from CSV:", error);
    res.status(500).send("Error importing tasks from CSV");
  }
};


module.exports = {
  Addtask,
  Tasks,
  DisplayTask,
  deleteTask,
  AdminTaskDisplay,
  searchTasks,
  updateTask,
  singletask,
  home,
  reviews,
  getTasksWithPagination,
  getTasks,
  exportTasksToCSV,
  importTasksFromCSV,
  upload,
};
