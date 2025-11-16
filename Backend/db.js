const mongoose = require("mongoose");

const mongoUri = "mongodb://localhost:27017/"

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log("connected successfully");
    }
    catch {
        console.log("Error messaged");
    }
};

module.exports = connectToMongo;