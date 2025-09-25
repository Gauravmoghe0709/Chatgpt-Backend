const express = require("express")
const authmiddleware = require("../middleware/auth.middleware")
const chatcontroller = require("../controllers/chat.controller")

const router = express.Router()



router.post("",authmiddleware.userchat,chatcontroller.newuserchat)




module.exports = router