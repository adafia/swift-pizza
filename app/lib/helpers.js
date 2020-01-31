/*
 * Helpers for various tasks
 *
 */


// Container for all the helpers
const helpers = {}

// Pasre a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
}


// Export the module
module.exports = helpers;
