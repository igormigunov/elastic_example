

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Store = require('../api/models/stores');
const Product = require('../api/models/products');

dotenv.load({ path: `../.env.${process.env.NODE_ENV || 'development'}` });

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});


const createOneProduct = data => Product.create(data);
const getRandomInt = (min = 1, max = 1000) => Math.floor(Math.random() * (max - min)) + min;

const createProducts = stores => data => Promise.all(stores.map(
  store => createOneProduct(Object.assign({}, data, { store }, { quantity: getRandomInt() })),
));
const justDoIt = async () => {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 1000;
  const stores = await Store.find().then(d => d.map(it => it._id));
  const createProductsWithStore = createProducts(stores);
  const lastBarcode = await Product.findOne().sort({ barcode: -1 }).then(d => (d ? d.barcode : 0));
  for (let current = 1; current <= count; current += 1) {
    await createProductsWithStore({
      name: `product_${lastBarcode + current}`,
      description: `product_${lastBarcode + current} description`,
      barcode: lastBarcode + current,
    });
    console.log(`${current}/${count}`);
  }
};

justDoIt().then(() => {
  process.exit();
}).catch((err) => {
  console.log(err);
  process.exit(1);
});
