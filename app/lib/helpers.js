/*
 * Helpers for various tasks
 *
 */

 // Dependencies
const crypto = require('crypto');
const config = require('./config');
const { read } = require('./data');

// Container for all the helpers
const Helpers = {
    // Pasre a JSON string to an object in all cases without throwing
    parseJsonToObject(str) {
        try {
            const obj = JSON.parse(str);
            return obj;
        } catch (e) {
            return {};
        }
    },

    // create a SHA256 hash
    hash (str) {
        if (typeof (str) == 'string' && str.length > 0) {
            const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
            return hash
        } else {
            return false;
        }
    },

    // Create a string of random alphanumeric characters, of a given length
    createRandomString (strLength) {
        strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;

        if (strLength) {
            // Define all the possible characters that could go into a string
            const possibleCharacters = 'abcdefghijklmnopqrstuvwxz0123456789';

            // Start the final string
            let str = '';
            for (i = 1; i <= strLength; i++) {
                // Get a random character from the possibleCharacters string
                const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
                // Append the randomeCharacter to the final string
                str += randomCharacter;
            }

            // Return the final String
            return str;

        } else {
            return false
        }
    },

    //Verify if a given token id is currently valid for a given user
    verifyToken (id, email, callback) {
        //Lookup the token
        const dir = 'tokens'
        read(dir, id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not expired
            if (tokenData.email == email && tokenData.expires > Date.now()) {
            callback(tokenData);
            } else {
            callback(false);
            }
        } else {
            callback(false);
        }
        });

    },
}

// Export the module
module.exports = Helpers;
