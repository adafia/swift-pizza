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
        read('users', userInput.email, (err, data) => {
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
                    create('users', userInput.email, userObject, err => {
                      if (!err) {
                        delete userObject.hashedPassword  
                        callback(200, { Message: 'User account has been created successfully', userObject });
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
                    Error: 'A user with that email address already exists'
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
    const email =
        typeof data.queryStringObject.email == 'string' &&
            data.queryStringObject.email.trim().length > 10
            ? data.queryStringObject.email.trim()
            : false;
    if (email) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false;
        // verify that the given token from headers is valid for the phone number
        verifyToken(token, email, tokenData => {
            if (typeof tokenData == 'object') {
                // Look up the user
                read('users', email, (err, data) => {
                    if (!err && data) {
                        // Remove the hashed password from the user object before returning it
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404, { Error: `User with email: ${email}, does not exist` });
                    }
                });
            } else
                callback(403, {
                    Error: 'Missing required token in header, or token is invalid'
                });
        });
    } else {
        callback(400, { Error: 'Please provide your email to retrieve your account' });
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

    if (userInput.email && userInput.email.trim().length > 0) {
        // verify that the given token from headers is valid for the phone number
        verifyToken(token, userInput.email, (tokenData) => {
            if (typeof tokenData == 'object') {
                // Look up the user
                read('users', userInput.email, (err, userData) => {
                if (!err && userData) {
                    // update the fields necessary
                    userData.firstName = userInput.firstName && userInput.firstName.trim().length > 0 ? userInput.firstName : userData.firstName
                    userData.lastName = userInput.lastName && userInput.lastName.trim().length > 0 ? userInput.lastName : userData.lastName
                    userData.phone = userInput.phone && userInput.phone.trim().length > 0 ? userInput.phone : userData.phone
                    userData.email = userInput.email && userInput.email.trim().length > 0 ? userInput.email : userData.email
                    userData.address = userInput.address && userInput.address.trim().length > 0 ? userInput.address : userData.address
                    userData.password = userInput.password && userInput.password.trim().length > 0 ? userInput.password : userData.password
                    // Save the new updates
                    update('users', userData.email, userData, err => {
                      if (!err) {
                        delete userData.hashedPassword;  
                        callback(200, { Message: 'User account has been updated successfully', userData });
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
        callback(400, { Error: 'Your email address is required to update your profile' });
    }
};

// Users - delete
// Required data: phone
users.delete = (data, callback) => {
    // Check the validity of the phone number
    const email =
        typeof data.queryStringObject.email == 'string' &&
            data.queryStringObject.email.trim().length > 10
            ? data.queryStringObject.email.trim()
            : false;
    if (email) {
        // Get the token from the headers
        const token = typeof data.headers.token == 'string' ? data.headers.token : false;
        // verify that the given token from headers is valid for the phone number
        verifyToken(token, email, tokenData => {
            if (typeof tokenData == 'object') {
                // Look up the user
                read('users', email, (err, userData) => {
                    if (!err && userData) {
                        destroy('users', email, err => {
                          if (!err) {
                            destroy('tokens', token, err => {
                              if (!err) {
                                callback(200, { Message: `User with email: ${email}, has been deleted successfully` });
                              } else {
                                callback(500, { Error: 'Could not delete the specified token' });
                              }
                            });
                          } else {
                            callback(500, {
                              Error: 'Could not delete the specified user'
                            });
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
