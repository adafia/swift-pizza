/*
 * Request Handlers
 *
 */

// Define the handlers
let handlers = {};

// Test Handler
handlers.test = function(data, callback) {
  callback(200);
};

// Not found Handler
handlers.notFound = function(data, callback) {
  callback(404);
};

// Export the handlers
module.exports = handlers;
