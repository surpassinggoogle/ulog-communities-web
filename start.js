require('dotenv').config();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000

// Environment Init
if (!process.env.BASIC_AUTH_USERNAME || !process.env.BASIC_AUTH_PASSWORD 
    || !process.env.DATABASE) throw new Error('ENV variable missing')

let BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME
let BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD
let DATABASE = process.env.DATABASE
if (BASIC_AUTH_USERNAME === '' || BASIC_AUTH_PASSWORD === '' || DATABASE === '' ) {
  process.stderr.write('Check .env file\n')
  process.exit(1)
}

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connection
  .on('connected', () => {
    console.log(`Mongoose connection open...`);
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

require('./models/Registration');
require('./models/Overseer');
const app = require('./app');

const server = app.listen(PORT, () => {
  console.log(`Express is running on port ${server.address().port}`);
});