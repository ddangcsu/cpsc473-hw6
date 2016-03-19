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

// Include body parser module middleware and configure it
var parser = require("body-parser");

// Configure express middleware
app.use(parser.json());

// Expose GET on /stats
app.get(wsStats, function (request, response){
    console.log("Serving GET on " + wsStats);

    // Send back the score statistic
    response.status(200);
    response.send(JSON.stringify(score));
    response.end();

});

// Expose POST on flip
app.post(wsFlip, function (request, response){

    var flip = {};
    var playerCall;
    var coin;

    console.log("Serving POST on " + wsFlip);

    // Parser middleware will create a request.body
    if (request.hasOwnProperty("body")) {
        if (request.body.hasOwnProperty("call")) {
            // Perform another check to make sure the value is either heads
            // or tails
            playerCall = request.body.call.trim();

            if (playerCall === "heads" || playerCall === "tails") {
               // Flip the coin
               coin = (Math.floor((Math.random() * 2) + 1) === 1) ? "heads" : "tails";

               if (coin === playerCall) {
                   // Set result
                   flip.result = "win";
                   // Update score 
                   score.win = score.win + 1;

               } else {
                   flip.result = "lose";
                   score.losses = score.losses + 1;
               }

                
            } else {
                console.log ("Invalid call");
                flip.error = "Invalid call value:  Expect either heads or tails";
            }
        } else {
            // Flip does not contain call data
            console.log ("Invalid input for POST");
            flip.error = "Improper data. Expect {call: head|tail} format";
        }

    } else {
        console.log("Parser is not working no body object");
    }

    response.status(200);
    response.send(JSON.stringify(flip));
    response.end();

});

// Run the server on the serverPort
app.listen(3000);

console.log("Server is running on port " + serverPort);
