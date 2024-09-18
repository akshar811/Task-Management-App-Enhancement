const mongoose = require("mongoose")

const commentschema = new mongoose.Schema({
    comment : String,
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})

const review = mongoose.model("comments" , commentschema)

module.exports = review