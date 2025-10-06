const mongoose = require ("mongoose")


const messageschema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userchat"
    },
    content:{
        type:String,
        require: true,
    },
    role:{
        type: String,
        enum : ["user","model","system"],
        default : "user"
    }

},{
    timestamps:true
})

const messagemodel = mongoose.model("usermessage",messageschema)


module.exports = messagemodel