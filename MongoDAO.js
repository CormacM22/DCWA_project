const MongoClient = require('mongodb').MongoClient;

var coll;

MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
        const db = client.db('proj2023MongoDB');
        coll = db.collection('managers');
    })
    .catch((error) => {
        console.log(error.message);
    });

var findAll = function () {
    return new Promise((resolve, reject) => {
        var cursor = coll.find();
        cursor.toArray()
            .then((documents) => {
                resolve(documents);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// Implement the exists function
var exists = function (managerId) {
    return new Promise((resolve, reject) => {
        coll.findOne({ _id: managerId }) // Assuming the ID field is '_id'
            .then((document) => {
                resolve(document !== null);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

// In MongoDAO.js
async function addManager(manager) {
    try {
        await coll.insertOne(manager);
    } catch (error) {
        console.log("Error", error);
        throw error; // Rethrow the error for further handling
    }
}

// In MongoDAO.js
async function exists(managerId) {
    const count = await coll.countDocuments({ _id: managerId });
    return count > 0;
}

module.exports = { findAll, exists, addManager };


