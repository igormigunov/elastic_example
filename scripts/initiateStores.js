

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const stores = require('../mocks/stores');
const Store = require('../api/models/stores');

dotenv.load({ path: `../.env.${process.env.NODE_ENV || 'development'}` });

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

let current = 0;

const processStore = data => Store.findOne({ id: data.id })
  .then(d => !d && Store.create(data))
  .then(() => console.log(`${++current}/${stores.length}`));

const justDoIt = () => Promise.all(stores.map(processStore));

justDoIt().then(() => {
  process.exit();
}).catch((err) => {
  console.log(err);
  process.exit(1);
});
