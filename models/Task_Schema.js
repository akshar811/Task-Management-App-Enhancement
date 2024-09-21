const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    des:  String,
    category: String,
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    duedate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
      },
    ],
  },
  { timestamps: true }
);

let Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
