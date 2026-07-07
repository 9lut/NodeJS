const mongoose = require('mongoose');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_NAME } = process.env;

main().catch(err => console.error("MongoDB connection error:", err));

async function main() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    console.log("MongoDB connected successfully");
}