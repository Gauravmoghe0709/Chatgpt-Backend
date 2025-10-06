const { Server } = require("socket.io");
const cookie = require("cookie")
const jwt = require("jsonwebtoken")
const usermodel = require("../models/user.model")
const aiservice = require("../services/ai.service")
const messagemodel = require("../models/message.model")
const { createvectormemory, querymemory } = require("../services/vector.service");



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
            console.log(socket.user)
            next() // allow connection


        } catch (error) { // block connection
            console.log("invalid token ")
        }


        io.on("connection", (socket) => {


            socket.on("ai-message", async (message) => {  //   sent a message to server from clien using this event

                /*const sentmessage = await messagemodel.create({
                      chat: message.chat,
                      userid: socket.user._id,
                      content: message.content,
                      role: "user"
                  })
                  const vectors = await aiservice.generateembedding(message.content) */ // generate the vectors 

                // why we use promise.all beasuse of obtimization and get a quick response to user from ai 
                


                const [sentmessage, vectors] = await Promise.all([

                    messagemodel.create({
                        chat: message.chat,
                        userid: socket.user._id,
                        content: message.content,
                        role: "user"
                    }),

                    aiservice.generateembedding(message.content),   // generate the vectors 

                ])

                await createvectormemory({            //  after generate a vectors create a memory in pinecone database using createvectormemory function
                    messageid: sentmessage._id,
                    vectors,
                    metadata: {                // metadata means extra information about this data
                        chat: message.chat,
                        user: socket.user._id,
                        text: message.content
                    }
                })

                /*const memory = await querymemory({       // querymomery in our database and return last 3 messages
                    queryvector: vectors,
                    limit: 3,
                    metadata: {}

                })*/


                /* await createvectormemory({               //  after generate a vectors create a memory in pinecone database using createvectormemory function
                     messageid: sentmessage._id,
                     vectors,
                     metadata: {                                  // metadata means extra information about this data
                         chat: message.chat,
                         user: socket.user._id,
                         text: message.content
                     }
                 })*/


                const [memory, chathistory] = await Promise.all([

                    querymemory({       // querymomery in our database and return last 3 messages
                        queryvector: vectors,
                        limit: 3,
                        metadata: {
                            chat: message.chat,
                        }

                    }),
                    messagemodel.find({    //  get a chathistory and log it
                        chat: message.chat
                    }).limit(5)

                ])

                /* 
                   messagemodel.find({    //  get a chathistory and log it
                    chat: message.chat
                }).limit(5)

                */

                const stm = chathistory.map(items => {
                    return {
                        role: items.role,
                        parts: [{ text: items.content }]
                    }
                })

                const ltm = [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `   
                                 these are previous message from this chat
                                 ${memory.map(items => items.metadata.text).join("\n")}
                                `
                            }
                        ]
                    }
                ]
                console.log(ltm[0])
                console.log(stm)


                const getresponse = await aiservice.generateResponse([...stm, ...ltm])


                /*const responsemessage = await messagemodel.create({
                    chat: message.chat,
                    userid: socket.user._id,
                    content: getresponse,
                    role: "model"
                })

                const responsevector = await aiservice.generateembedding(getresponse)

                await createvectormemory({
                    messageid: responsemessage._id,
                    vectors: responsevector,
                    metadata: {                                  // metadata means extra information about this data
                        chat: message.chat,
                        user: socket.user._id,
                        text: getresponse
                    }

                })*/


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
                    metadata: {                                  // metadata means extra information about this data
                        chat: message.chat,
                        user: socket.user._id,
                        text: getresponse
                    }

                })


                socket.emit("ai-response", {    //  sent a response to client using this event
                    content: getresponse,
                })

            })


        })
    })
}



module.exports = initialsocket