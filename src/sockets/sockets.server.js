const { Server, Socket } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const usermodel = require("../models/user.model")
const aiservice = require("../services/ai.service")


function initialsocket(httpserver) {
    const io = new Server(httpserver, {})

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "") // token sent by client
        console.log(cookies)

        if (!cookies) {
            next(new Error("no token provided..."))
        }

        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
            const user = await usermodel.findById(decoded._id)

            socket.user = user
            next() // allow connection


        } catch (error) { // block connection
            console.log("invalid token ")
        }


        io.on("connection", (Socket) => {

            Socket.on("ai-message", async (message) => {

                const response = await aiservice.generateResponse(message.content)

                Socket.emit("ai-response",{
                    content:response,
                    
                })


            })




        })
    })
}



module.exports = initialsocket