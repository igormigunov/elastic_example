const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Store = require('../api/models/stores');

dotenv.load({ path: `../.env.${process.env.NODE_ENV || 'development'}` });

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});
mongoose.Promise = Promise;

Store.esTruncate((err) => {
  if (err) {
    console.log(err);
    // process.exit(1);
  }
  const stream = Store.synchronize();
  let count = 0;

  stream.on('data', (err, data) => {
    console.log(count, data.id);
    count += 1;
  });
  stream.on('close', () => {
    console.log(`indexed ${count} documents!`);
    process.exit(0);
  });
  stream.on('error', (err) => {
    console.log(err);
  });
});
