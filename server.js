require("dotenv").config()
const app = require("./src/app")
const connecttodb = require("./src/db/db")
const initialsocket = require("./src/sockets/sockets.server")
const httpserver = require("http").createServer(app)

connecttodb()
initialsocket(httpserver)
    
const PORT = process.env.PORT || 3000;
httpserver.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});