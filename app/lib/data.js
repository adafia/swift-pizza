/*
 * Library for Creating, reading, updating and deleting data using the fs module
 *
 */

 // Dependencies
const fs = require('fs');
const { join } = require('path');

// Define the base directory of the data folder
const baseDir = join(__dirname, '/../.data/');

const Crud = {
    // write data to a file
    create (dir, file, data, callback) {
        // open the file for writing
        fs.open(`${baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // convert data to a string
                const stringData = JSON.stringify(data);

                // write to file and close it
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback('Error claosing new file');
                            }
                        });
                    } else {
                        callback('Error witing to the new file');
                    }
                });
            } else {
                callback('Could not create new file, it may already exist');
            }
        });
    },

    // Pasre a JSON string to an object in all cases without throwing
    parseJsonToObject(str) {
        try {
            const obj = JSON.parse(str);
            return obj;
        } catch (e) {
            return {};
        }
    },

    // Read data from a file
    read (dir, file, callback) {
        fs.readFile(`${baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
            if (!err && data) {
                const parsedData = Crud.parseJsonToObject(data);
                callback(false, parsedData);
            } else {
                callback(err, data);
            }
        });
    },

    // Update an existing file
    update (dir, file, data, callback) {
        // open the file for writing
        fs.open(`${baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // convert the data to string format
                const stringData = JSON.stringify(data);

                // Truncate the contents of the file before writing data to the file
                fs.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        // Write to the file and close it
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback('Error closing existing file');
                                    }
                                })
                            } else {
                                callback('Error writing to existing file');
                            }
                        })
                    } else {
                        callback('Error truncating this file');
                    }
                })
            } else {
                callback('Could not open the file for updating, it may not exist yet');
            }
        });
    },

    // Removing / deleting / destroying a file
    destroy (dir, file, callback) {
        // unlinking the file
        fs.unlink(`${baseDir}${dir}/${file}.json`, (err) => {
            if (!err) {
                callback(false);
            } else {
                callback('Error deleting the file');
            }
        });
    },

    // Listing all the items in a directory
    list (dir, callback) {
        fs.readdir(`${baseDir}${dir}/`, (err, data) => {
            if (!err && data && data.length > 0) {
                let trimmedFileNames = [];
                data.forEach((fileName) => {
                    trimmedFileNames.push(fileName.replace('.json', ''));
                });
                callback(false, trimmedFileNames);
            } else {
                callback(err, data);
            }
        })
    },

}

// Export an instance of Crud
module.exports = Crud
