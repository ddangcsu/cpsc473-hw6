/* jshint curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true, node: true */
/*
    Name: David Dang
    Section: 1
    Modulize the redis database connection
 */
"use strict";

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

var get = function (callback) {
    // Modify GET stats service to get the data result from redis
    client.hgetall(key, function (err, result) {
        if (result !== null) {
            console.log("Retrieved all for " + key + " success");
            callback(result);
        } else {
            console.log("redis received error for " + key);
            callback(false);
        }
    });
};

var reset = function (callback) {
    // Code to reset redis to zero
    client.hmset(key, {wins: 0, losses: 0}, function (err) {
        if (err === null) {
            console.log("flipcoin:score reset");
            callback(true);
        } else {
            console.log("flipcoin:score not reset: " + err);
            callback(false);
        }
    });
};

var update = function (subkey, callback) {
    // No error, need to increase the score by 1 then send response
    client.hincrby(key, subkey, 1, function (err, result) {
        if (err === null) {
            console.log( subkey + " is now set to: " + result);
            callback(true);
        } else {
            console.log("unable to increase " + subkey + " by 1 " + err);
            callback(false);
        }
    });
};

// Export the function module
module.exports.get = get;
module.exports.reset = reset;
module.exports.update = update;
