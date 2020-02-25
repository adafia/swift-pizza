/*
 * Index of Request Handlers
 *
 */

 // Dependencies
const users = require('./users');
const tokens = require('./tokens');


const handlers = {}

// Connecting handlers
handlers.users = users
handlers.tokens = tokens


// Not found Handler
handlers.notFound = function (data, callback) {
    callback(404);
};



module.exports = handlers