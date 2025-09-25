const mongoose = require("mongoose")



async function connecttodb() {

    try {
        await mongoose.connect(process.env.MONGOOSE_URL)
        console.log("connect to Chatgpt user database")
    } catch (error) {
        console.log(error)
    }
}


module.exports = connecttodb