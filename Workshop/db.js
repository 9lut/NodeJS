const mongoose = require('mongoose');
require('dotenv').config();

const { DB_HOST, DB_PORT, DB_NAME } = process.env;

mongoose.connection.on('connected', () => {
  console.log('MongoDB Connected');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Error:', err);
});

async function main() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(
      `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`
    );

  } catch (err) {
    console.error(err);
  }
}

main();

module.exports = mongoose;