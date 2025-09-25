const jwt = require("jsonwebtoken")
const usermodel = require("../models/user.model")

async function userchat(req,res,next){
      const {token} = req.cookies

      if(!token){return res.status(401).json({message:"invalid token..."})}

       try {
         const decode = jwt.verify(token,process.env.JWT_SECRET)
         const user = await usermodel.findOne(decode.id)
         
         req.user = user
         next()

       } catch (error) {
        console.log(error)
       }


}


module.exports = {
    userchat
}