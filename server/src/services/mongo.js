require('dotenv').config();
const mongoose = require('mongoose');

/**
 * 
 * Mongo Db connection services
 */

const MONGO_URL = process.env.MONGO_URL;

 // mongoose connection event emitter. 
 mongoose.connection.once('open', () => {
    console.log('MongoDb connection ready')
  });

  mongoose.connection.on('error', (err) => {
    console.error(err)
  })


  async function mongoConnect() {
    await mongoose.connect(MONGO_URL);
  }

  async function mongoDisconnect() {
    await mongoose.disconnect();
  }

  module.exports = {
    mongoConnect,
    mongoDisconnect
  }