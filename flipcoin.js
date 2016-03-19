/*
    Name: David Dang
    Section: 1
    Node.js Web Service API to flip a coin
 */

// Declare a set of variables to be use
var serverPort = 3000;
var wsStats = "/stats";
var wsFlip = "/flip";
var score = { win: 0, losses: 0};

// Include the express module and initiate the app
var express = require("express");
var app = express();

// Expose GET on /stats
app.get(wsStats, function (request, response){
    // TODO: code to handle the stats
    console.log("Serving GET on " + wsStats);
    response.status(200);
    response.send("Hello from Get");
    response.end();

});

// Expose POST on flip
app.post(wsFlip, function (request, response){
    //TODO: code to handle post request to flip
    var flipResult = {};
    console.log("Serving POST on " + wsFlip);
    //console.log(request);

    response.status(200);
    response.send("Hello from Post");
    response.end();

});

// Run the server on the serverPort
app.listen(3000);

console.log("Server is running on port" + serverPort);
