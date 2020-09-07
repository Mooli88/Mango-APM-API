require("dotenv").config();
var http = require("http");
var APM = require("./APM");

//create a server object:
http
  .createServer(async function (req, res) {
    console.time();
    const data = await APM.getUserAccount();
    console.log("data", data);
    console.timeEnd();
  })
  .listen(8080); //the server object listens on port 8080
