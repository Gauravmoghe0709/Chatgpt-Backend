const express = require("express")
const usercontroller = require("../controllers/user.controller")

const router = express.Router() 


router.post("/newuser",usercontroller.registeruser)
router.post("/loginuser",usercontroller.loginuser)




module.exports = router