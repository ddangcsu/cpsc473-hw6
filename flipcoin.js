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

// Declare redis host and port
var redisServer = {
    host: "127.0.0.1",
    port: 6379,
};

// Declare redis key to store the score
var key = "flipcoin:score";

// Initialize redis and setup a client
var redis = require("redis");
var client = redis.createClient(redisServer.port, redisServer.host);

// Catch client errors
client.on("error", function (err) {
    console.log("Client ran into an error: " + err);
});

client.on("ready", function (err) {
    if (err !== null) {
        console.log("Redis Client ready.  Initializing score if needed");

        client.hgetall(key, function (err, result) {
            if (result === null) {
                client.hmset(key, {wins: 0, losses: 0}, function (err, result) {
                    if (result !== null) {
                        console.log("flipcoin:score initialized");
                    } else {
                        console.log("Initialized error: " + err);
                    }
                });
            } else {
                console.log("Flipcoin:score already set");
            }
        });
    } else {
        console.log("Having problem connect to redis " + err);
        process.exit(1);
    }
});

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

    // Modify GET stats service to get the data result from redis
    client.hgetall(key, function (err, result) {
        if (result !== null) {
            response.status(200).json(result).end();
        } else {
            response.status(400).end("redis error retrieve score");
        }
    });

});

// Expose DELETE on /stats
app.delete(wsStats, function (request, response) {
    console.log ("Serving DELETE on " + request.url);

    // Code to reset redis to zero
    client.hmset(key, {wins: 0, losses: 0}, function (err) {
        if (err === null) {
            console.log("flipcoin:score reset");
            response.status(200).end("reset");
        } else {
            console.log("flipcoin:score not reset: " + err);
            response.status(500).end("error reset score");
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

        client.hincrby(key, subkey, 1, function (err, result) {
            if (err === null) {
                console.log( subkey + " is now set to: " + result);
                response.status(200).json(flip).end();
            } else {
                console.log("unable to increase " + subkey + " by 1 " + err);
                response.status(500).end("Cannot increase score");
            }
        });
    }

});

// Run the server on the serverPort
app.listen(serverPort);

console.log("Server is running on port " + serverPort);
