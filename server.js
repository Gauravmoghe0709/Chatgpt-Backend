require("dotenv").config()
const app = require("./src/app")
const connecttodb = require("./src/db/db")
const initialsocket = require("./src/sockets/sockets.server")
const httpserver = require("http").createServer(app)

connecttodb()
initialsocket(httpserver)
    
httpserver.listen(3000,()=>{
    console.log(("server running on port 3000"))
})