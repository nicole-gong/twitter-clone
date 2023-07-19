const mongoose = require('mongoose')

class Database {
    constructor() {
        this.connect()
    }
    
    connect() {
        mongoose.connect("mongodb+srv://twitterClone:twitterClone@nicoles-test-project.fh3bnrr.mongodb.net/?retryWrites=true&w=majority")
        .then(() => { console.log("Database connection successful.") })
        .catch((err) => { console.log(err) })
    }
}

module.exports = new Database()