const usermodel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")



async function registeruser(req,res){
    
    const {fullname:{firstname,lastname},email,password} = req.body

    const userexist = await usermodel.findOne({
        email
    })
    if(userexist){
        return res.status(401).json({
            message:"user already exist..."
        })
    }

    const hashpassword = await bcryptjs.hash(password,10)

     const newuser = await usermodel.create({
        fullname:{
            firstname,
            lastname
        },
        email,
        password:hashpassword
        
     })

     const token = await jwt.sign({id:newuser._id},process.env.JWT_SECRET)
     res.cookie("token",token)


     res.status(201).json({
        message:"New user created...",
        newuser:{
            email:newuser.email,
            _id:newuser._id
        }
     })
    
}

async function loginuser(req,res) {

    const{email,password} = req.body

    const user = await usermodel.findOne({
        email
    })
    if(!user){
        return res.status(401).json({
            message:"email not found..."
        })
    }
    
    const userpassword = await bcryptjs.compare(password, user.password)
    if(!userpassword){return res.status(401).json({message:"password not match"})}

    const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
    res.cookie("token",token)

    res.status(201).json({
        message:"login user sucessfully...",
        user:{
            _id: user._id,
            email: user.email,
        }
    })

}

module.exports={
    registeruser,
    loginuser
}