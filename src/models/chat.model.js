const mongoose = require("mongoose")




const chatschame = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    lastactivity: {
        type: Date,
        default: Date.now
    }
})


const chatmodel = mongoose.model("userchat", chatschame)

module.exports = chatmodel