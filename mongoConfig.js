const mongoose = require('mongoose');
const url = "mongodb+srv://alcuevasal:12345@products.thkd3.mongodb.net/?retryWrites=true&w=majority&appName=products"

async function connectDB() {
    try {
        await mongoose.connect(url);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("MongoDB connection failed ", error);
    }
}

module.exports = connectDB;

