const { Server } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const usermodel = require("../models/user.model")
const aiservice = require("../services/ai.service")
const messagemodel = require("../models/message.model")


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


        io.on("connection", (socket) => {

            console.log(socket)

            socket.on("ai-message", async (message) => {

                await messagemodel.create({
                    chat: message.chat,
                    id: socket.id,
                    content: message.content,
                    role: "user"
                })

                const getresponse = await aiservice.generateResponse(message.content)

                await messagemodel.create({
                    chat: message.chat,
                    content: getresponse,
                    role: "model"
                })


                socket.emit("ai-response",{
                    content: getresponse,
                })


            })




        })
    })
}



module.exports = initialsocket