const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            require:true,
        },
        lastname:{
            type:String,
            require:true,
        }
    },
     email:{
        type:String,
        require:true,
        unique:true,
     },
     password:{
        type:String,
     }

})


 const usermodel = mongoose.model("userdatas",userschema)

 module.exports = usermodel