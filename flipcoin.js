/*
    Name: David Dang
    Section: 1
    Node.js Web Service API to flip a coin
 */
"use strict";
// Declare a set of variables to be use
var serverPort = 3000;
var wsStats = "/stats";
var wsFlip = "/flip";
var score = {
    wins: 0,
    losses: 0
};

// Include the express module and initiate the app
var express = require("express");
var app = express();

// Include body parser module middleware and configure it
var parser = require("body-parser");

// Configure express middleware
app.use(parser.json());

// Expose GET on /stats
app.get(wsStats, function (request, response) {
    console.log("Serving GET on " + request.url);

    // Send back the score statistic
    response.status(200).json(score).end();

});

// Expose POST on flip
app.post(wsFlip, function (request, response) {

    console.log("Serving POST on " + request.url);

    var flip = {};
    var playerCall;
    var coin = "tails";

    // Parser middleware will create a request.body
    if (request.hasOwnProperty("body")) {
        if (request.body.hasOwnProperty("call")) {
            // Perform another check to make sure the value is either heads
            // or tails
            playerCall = request.body.call.trim();

            if (playerCall === "heads" || playerCall === "tails") {

                // Flip the coin if we get a 1 then it's heads else tails
                if (Math.floor(Math.random() * 2) === 1) {
                    coin = "heads";
                }

                if (coin === playerCall) {
                    // Set result
                    flip.result = "win";
                    // Update score
                    score.wins = score.wins + 1;

                } else {
                    flip.result = "lose";
                    score.losses = score.losses + 1;
                }

            } else {
                console.log("Invalid call");
                flip.error = "Invalid call value. Expect either heads or tails";
            }
        } else {
            // Flip does not contain call data
            console.log("Invalid input for POST");
            flip.error = "Improper data. Expect {call: heads | tails } format";
        }

    } else {
        console.log("Parser is not working no body object");
    }

    //Output on server console to show result info
    console.log("User call: " + playerCall);
    console.log("Coin flip: " + coin);
    console.log("Result is: " + flip.result);

    response.status(200).json(flip).end();

});

// Run the server on the serverPort
app.listen(3000);

console.log("Server is running on port " + serverPort);
