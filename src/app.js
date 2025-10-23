const express = require("express")
const cookieparser = require("cookie-parser")
const authroutes = require("./routes/auth.routes")
const chatroute = require("./routes/chat.routes")
const cors = require ("cors")
const path = require("path")



const app = express()
app.use(cors({
    credentials:true,
    origin:"http://localhost:5173"
}))
app.use(express.json())
app.use(cookieparser())
app.use(express.static(path.join(__dirname, "../Public")))
app.use("/user",authroutes)
app.use("/userchats",chatroute)
app.get("*name",(req,res)=>{
    res.sendFile(path.join(__dirname,"../Public/index.html"))
})




module.exports = app