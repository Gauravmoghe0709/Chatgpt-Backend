const chatmodel = require("../models/chat.model")
const messagemodel = require("../models/message.model")



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
async function getallchats(req,res){
    const user = req.user

    const getuser = await chatmodel.find({user:user._id})

    res.json({
        message:"Fetch all chats",
        getuser,

    })
    
}

async function getmessages(req,res){
    
    const chatid= req.params.id

    const messages = await messagemodel.find({chat:chatid}).sort({createsAt:1})

    res.status(201).json({
        message:"messages retrived",
        messages:messages
        
    })

}

module.exports = {
    newuserchat,
    getallchats,
    getmessages
}

