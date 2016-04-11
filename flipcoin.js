/* jshint curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true, node: true */
/*
    Name: David Dang
    Section: 1
    Node.js Web Service API to flip a coin
    Improved version with Redis to save stats

 */
"use strict";
// Declare a set of variables to be use
var serverPort = 3000;
var wsStats = "/stats";
var wsFlip = "/flip";

// Include the express module and initiate the app
var express = require("express");
var app = express();

// Include body parser module middleware and configure it
var parser = require("body-parser");
// Configure express middleware
app.use(parser.json());

// Include my module
var db = require("./hw6_redis.js");

// Expose GET on /stats
app.get(wsStats, function (request, response) {
    console.log("Serving GET on " + request.url);
    db.get(function (result) {
        if (result !== false) {
            response.status(200).json(result).end();
        } else {
            response.status(200).json({"error":"fail retrieved"}).end();
        }
    });
});

// Expose DELETE on /stats
app.delete(wsStats, function (request, response) {
    console.log ("Serving DELETE on " + request.url);
    db.reset(function (success) {
        if (success) {
            response.status(200).json({"status": "reset"}).end();
        } else {
            response.status(200).json({"status": "error failed to reset"}).end();
        }
    });
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
                    //score.wins = score.wins + 1;
                } else {
                    flip.result = "lose";
                    //score.losses = score.losses + 1;
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

    if ( flip.hasOwnProperty("error") ) {
        // Sent error status back
        response.status(200).json(flip).end();
    } else {
        // No error, need to increase the score by 1 then send response
        var subkey = (flip.result === "win")? "wins" : "losses";
        db.update(subkey, function (success) {
            if (success) {
                response.status(200).json(flip).end();
            } else {
                response.status(500).end("Cannot increase score");
            }
        });
    }

});

// Run the server on the serverPort
app.listen(serverPort);

console.log("Server is running on port " + serverPort);
