const chatmodel = require("../models/chat.model")


async function newuserchat(req,res){
    const {title} = req.body
    const user = req.user
    

    const chat = await chatmodel.create({
        user: user._id,
        title,

         
       
    })

    res.status(201).json({

        message:"new chat sucessfully...",
        chat:{
            _id:chat._id,
            title:chat.title,
            lastactivity:chat.lastactivity,
            user: chat.user
        }
    })

}

module.exports = {
    newuserchat
}
