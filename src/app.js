const express = require("express")
const cookieparser = require("cookie-parser")
const authroutes = require("./routes/auth.routes")
const chatroute = require("./routes/chat.routes")
const cors = require ("cors")



const app = express()
app.use(cors({
    credentials:true,
    origin:"http://localhost:5173"
}))
app.use(express.json())
app.use(cookieparser())
app.use("/user",authroutes)
app.use("/userchats",chatroute)



module.exports = app