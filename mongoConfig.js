const mongoose = require('mongoose');
const url = "mongodb+srv://padrinoelmejor97:proyecto1234@shippings.n10xz.mongodb.net/?retryWrites=true&w=majority&appName=Shippings"

async function connectDB() {
    try {
        await mongoose.connect(url);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection failed ", error);
    }
}

module.exports = connectDB;

