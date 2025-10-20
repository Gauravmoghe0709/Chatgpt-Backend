const { Server } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const usermodel = require("../models/user.model")
const aiservice = require("../services/ai.service")
const messagemodel = require("../models/message.model")
const { createvectormemory, querymemory } = require("../services/vector.service");


function initialsocket(httpserver) {
    const io = new Server(httpserver, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }
    })

    // Auth middleware: attach user to socket or reject
    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers?.cookie || "")
            if (!cookies || !cookies.token) return next(new Error("no token provided..."))

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
            const user = await usermodel.findById(decoded._id)
            if (!user) return next(new Error("invalid user"))

            socket.user = user
            next()
        } catch (error) {
            console.log("socket auth error:", error.message)
            next(new Error("authentication error"))
        }
    })

    io.on("connection", (socket) => {
        console.log("user connected...", socket.id)

        socket.on("ai-message", async (message) => {
            console.log('received ai-message:', { socketId: socket.id, message })
            try {
                const [sentmessage, vectors] = await Promise.all([
                    messagemodel.create({
                        chat: message.chat,
                        userid: socket.user._id,
                        content: message.content,
                        role: "user"
                    }),
                    aiservice.generateembedding(message.content),
                ])

                await createvectormemory({
                    messageid: sentmessage._id,
                    vectors,
                    metadata: {
                        chat: message.chat,
                        user: socket.user._id,
                        text: message.content
                    }
                })

                const [memory, chathistory] = await Promise.all([
                    querymemory({
                        queryvector: vectors,
                        limit: 3,
                        metadata: { chat: message.chat }
                    }),
                    messagemodel.find({ chat: message.chat }).limit(5)
                ])

                const stm = chathistory.map(items => ({ role: items.role, parts: [{ text: items.content }] }))

                const ltm = [{ role: "user", parts: [{ text: `these are previous message from this chat\n${memory.map(items => items.metadata.text).join("\n")}` }] }]

                const getresponse = await aiservice.generateResponse([...stm, ...ltm])

                const [responsemessage, responsevector] = await Promise.all([
                    messagemodel.create({
                        chat: message.chat,
                        userid: socket.user._id,
                        content: getresponse,
                        role: "model"
                    }),
                    aiservice.generateembedding(getresponse),
                ])

                await createvectormemory({
                    messageid: responsemessage._id,
                    vectors: responsevector,
                    metadata: {
                        chat: message.chat,
                        user: socket.user._id,
                        text: getresponse
                    }
                })

                console.log('emitting ai-response for chat:', message.chat)
                socket.emit("ai-response", { chatId: message.chat, content: getresponse })
            } catch (err) {
                console.error("ai-message handler error:", err)
                socket.emit("ai-response", { content: "An error occurred while generating response." })
            }
        })
    })
}

module.exports = initialsocket