/*
 * Request tokens
 *
 */

// Dependencies
const _data = require('../data');
const helpers = require('../helpers');

// Define the Tokens
let tokens = {};

// Tokens
tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Tokens - post
// Required data: phone, password
// Optional data: none
tokens.post = (data, callback) => {
    const phone =
        typeof data.payload.phone == 'string' &&
            data.payload.phone.trim().length > 10
            ? data.payload.phone.trim()
            : false;
    const password =
        typeof data.payload.password == 'string' &&
            data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    if (phone && password) {
        // Lookup the user who matches that phone number
        _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // Hash the sent password, and compare it to the password stored in the user object
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    // if valid create a new token with a random name, set expiration date 1hr in the future
                    const tokenId = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone: phone,
                        id: tokenId,
                        isAdmin: userData.isAdmin,
                        expires: expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, err => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { Error: 'Could not create the new toke' });
                        }
                    });
                } else {
                    callback(400, { Error: 'Password did not match the specified user' });
                }
            } else {
                callback(400, { Error: 'Could not find the specified user' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields' });
    }
};

// Tokens - get
// Required data: id
// Optional data: none
tokens.get = (data, callback) => {
    // Check that the id is valid
    const id =
        typeof data.queryStringObject.id == 'string' &&
            data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;
    if (id) {
        // Look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
tokens.put = (data, callback) => {
    const id =
        typeof data.payload.id == 'string' && data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;
    const extend =
        typeof data.payload.extend == 'boolean' && data.payload.extend == true
            ? true
            : false;

    if (id && extend) {
        // look up the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    //Update the token
                    _data.update('tokens', id, tokenData, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                Error: "Could not update the token's expiration"
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: 'The token has already expired, and cannot be extended'
                    });
                }
            } else {
                callback(400, { Error: 'Specified token does not exist' });
            }
        });
    } else {
        callback(400, {
            Error: 'Missing required field(s) or field(s) are invalid'
        });
    }
};

// Tokens - delete
// Required data: id
// Optional data: id
tokens.delete = (data, callback) => {
    // Check the validity of the id
    const id =
        typeof data.queryStringObject.id == 'string' &&
            data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;
    if (id) {
        // Look up the token
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.remove('tokens', id, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, { Error: 'Could not delete the specified token' });
                    }
                });
            } else {
                callback(400, { Error: 'Could not find the specified token' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required field' });
    }
};

// Export the tokens
module.exports = tokens;
