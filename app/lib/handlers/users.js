/*
 * Request Users
 *
 */

// Dependencies
const { read, create, update, destroy } = require('../data');
const { verifyToken, hash } = require('../helpers');
const validations = require('../validations');

// Define the Users
let users = {};

// Users
users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Users - post
// Required data: firstname, lastname, phone, email address, street address, password, tosAgreement
// optional data: none
users.post = (data, callback) => {
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
        read('users', userInput.phone, (err, data) => {
            if (err) {
                // Hash the password
                const hashedPassword = hash(userInput.password);

                // create the user object
                if (hashedPassword) {
                    const userObject = {
                        firstName: userInput.firstName,
                        lastName: userInput.lastName,
                        phone: userInput.phone,
                        email: userInput.email,
                        address: userInput.address,
                        isAdmin: false,
                        hashedPassword: hashedPassword,
                        tosAgreement: true
                    };

                    // Store the user
                    create('users', userInput.phone, userObject, err => {
                      if (!err) {
                        callback(200);
                      } else {
                        console.log(err);
                        callback(500, {
                          Error: 'Could not create the new user'
                        });
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
users.get = (data, callback) => {
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
        verifyToken(token, phone, tokenData => {
            if (typeof tokenData == 'object') {
                // Look up the user
                read('users', phone, (err, data) => {
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
users.put = (data, callback) => {
    const userInput = {
        firstname: data.payload.firstName,
        lastName: data.payload.lastName,
        phone: data.payload.phone,
        email: data.payload.email,
        address: data.payload.address,
        password: data.payload.password
    };


    // Get the token from the headers
    const token = typeof data.headers.token == 'string' ? data.headers.token : false;

    if (userInput.phone && userInput.phone.trim().length > 0) {
        // verify that the given token from headers is valid for the phone number
        verifyToken(token, userInput.phone, (tokenData) => {
            if (typeof tokenData == 'object') {
                // Look up the user
                read('users', userInput.phone, (err, userData) => {
                if (!err && userData) {
                    // update the fields necessary
                    userData.firstName = userInput.firstName && userInput.firstName.trim().length > 0 ? userInput.firstName : userData.firstName
                    userData.lastName = userInput.lastName && userInput.lastName.trim().length > 0 ? userInput.lastName : userData.lastName
                    userData.phone = userInput.phone && userInput.phone.trim().length > 0 ? userInput.phone : userData.phone
                    userData.email = userInput.email && userInput.email.trim().length > 0 ? userInput.email : userData.email
                    userData.address = userInput.address && userInput.address.trim().length > 0 ? userInput.address : userData.address
                    userData.password = userInput.password && userInput.password.trim().length > 0 ? userInput.password : userData.password
                    // Save the new updates
                    update('users', userData.phone, userData, err => {
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
    } else {
        callback(400, { Error: 'Your phone number is required to update your profile' });
    }
};

// Users - delete
// Required data: phone
users.delete = (data, callback) => {
    // Check the validity of the phone number
    const phone =
        typeof data.queryStringObject.phone == 'string' &&
            data.queryStringObject.phone.trim().length > 10
            ? data.queryStringObject.phone.trim()
            : false;
    if (phone) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false;
        // verify that the given token from headers is valid for the phone number
        verifyToken(token, phone, tokenData => {
            if (typeof tokenData == 'object') {
                // Look up the user
                read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        destroy('users', phone, err => {
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
                                        destroy('checks', checkId, err => {
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


// Export the users
module.exports = users;
