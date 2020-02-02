/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const validations = require('./validations');

// Define the handlers
let handlers = {};

// Users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstname, lastname, phone, email address, street address, password, tosAgreement
// optional data: none
handlers._users.post = (data, callback) => {
  const userInput = {
    firstName: data.payload.firstName,
    lastName: data.payload.lastName,
    phone: data.payload.phone,
    email: data.payload.email,
    address: data.payload.address,
    password: data.payload.password,
    tosAgreement: data.payload.tosAgreement
  };

  // validate user input
  const result = validations._userCreate(userInput);

  if (result == true) {
    // Make sure that the user doesnt already exist
    _data.read('users', userInput.phone, (err, data) => {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(userInput.password);

        // create the user object
        if (hashedPassword) {
          const userObject = {
            firstName: userInput.firstName,
            lastName: userInput.lastName,
            phone: userInput.phone,
            email: userInput.email,
            address: userInput.address,
            hashedPassword: hashedPassword,
            tosAgreement: true
          };

          // Store the user
          _data.create('users', userInput.phone, userObject, err => {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user's password" });
        }
      } else {
        // user already exists
        callback(400, {
          Error: 'A user with that phone number already exists'
        });
      }
    });
  } else {
    callback(400, { Error: result });
  }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  // check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length > 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // verify that the given token from headers is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the user object before returning it
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else
        callback(403, {
          Error: 'Missing required token in header, or token is invalid'
        });
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least on must be specified)
handlers._users.put = (data, callback) => {
  const userInput = {
    firstName: data.payload.firstName,
    lastName: data.payload.lastName,
    phone: data.payload.phone,
    email: data.payload.email,
    address: data.payload.address,
    password: data.payload.password
  };

  const result = validations._userUpdate(userInput);

  // Error if the phone is invalid
  if (result !== true) {
    callback(400, { Error: result });
  } else {
    // Get the token from the headers
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // verify that the given token from headers is valid for the phone number
		handlers._tokens.verifyToken(token, userInput.phone, tokenIsValid => {
			if (tokenIsValid) {
        // Look up the user
				_data.read('users', userInput.phone, (err, userData) => {
          if (!err && userData) {
            // update the fields necessary
						if (userInput.firstName) {
							userData.firstName = userInput.firstName;
            }
						if (userInput.lastName) {
							userData.lastName = userInput.lastName;
            }
						if (userInput.email) {
							userData.email = userInput.email;
            }
						if (userInput.address) {
							userData.address = userInput.address;
            }
						if (userInput.password) {
							userData.hashedPassword = helpers.hash(userInput.password);
            }
            // Save the new updates
            _data.update('users', userInput.phone, userData, err => {
              if (!err) {
                callback(200);
              } else {
                console.log(err);
                callback(500, { Error: 'Could not update user' });
              }
            });
          } else {
            callback(400, { Error: 'The specified user does not exist' });
          }
        });
      } else {
        callback(403, {
          Error: 'Missing required token in header, or token is invalid'
        });
      }
    });
  }
};

// Users - delete
// Required data: phone
handlers._users.delete = (data, callback) => {
  // Check the validity of the phone number
  const phone =
    typeof data.queryStringObject.phone == 'string' &&
    data.queryStringObject.phone.trim().length > 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Get the token from the headers
    const token =
      typeof data.headers.token == 'string' ? data.headers.token : false;
    // verify that the given token from headers is valid for the phone number
    handlers._tokens.verifyToken(token, phone, tokenIsValid => {
      if (tokenIsValid) {
        // Look up the user
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            _data.delete('users', phone, err => {
              if (!err) {
                // Delete each of the checks associated with the user
                const userChecks =
                  typeof userData.checks == 'object' &&
                  userData.checks instanceof Array
                    ? userData.checks
                    : [];
                const checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // Loop through the checks
                  userChecks.forEach(checkId => {
                    // Delete the Check
                    _data.delete('checks', checkId, err => {
                      if (!err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {
                            Error:
                              'Errors encountered while attempting to delete checks'
                          });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, { Error: 'Could not delete the specified user' });
              }
            });
          } else {
            callback(400, { Error: 'Could not find the specified user' });
          }
        });
      } else {
        callback(403, {
          Error: 'Missing required token in header, or token is invalid'
        });
      }
    });
  } else {
    callback(400, { Error: 'Missing required field' });
  }
};

// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
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
handlers._tokens.get = (data, callback) => {
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
handlers._tokens.put = (data, callback) => {
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
handlers._tokens.delete = (data, callback) => {
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
        _data.delete('tokens', id, err => {
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

//Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

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
