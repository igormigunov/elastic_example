const mongoose = require('mongoose');
const dotenv = require('dotenv');
const elasticsearch = require('elasticsearch');
const Products = require('../api/models/products');

dotenv.load({ path: `../.env.${process.env.NODE_ENV || 'development'}` });

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});
mongoose.Promise = Promise;

const esMapping = {
  name: {
    type: 'text',
  },
  description: {
    type: 'text',
  },
  barcode: {
    type: 'keyword',
  },
};

const getMapping = (type, mapping) => ({
  [type]: {
    properties: Object.keys(mapping)
      .reduce((r, key) => Object.assign(r, { [key]: mapping[key] }), {}),
  },
});

const createMapping = client => options => client.indices.putMapping({
  index: `${options.indexType}s`,
  type: options.indexType,
  body: getMapping(options.indexType, options.mapping),
});
const reindexOne = client => options => item => client.index({
  index: `${options.indexType}s`,
  type: options.indexType,
  id: item.barcode,
  body: item,
});

const getProductsStream = mapping => (filter = {}) => Products
  .aggregate([
    { $match: filter },
    {
      $group: Object.assign({
        _id: '$barcode',
      }, Object.keys(mapping).reduce((r, key) => Object.assign(r, { [key]: { $first: `$${key}` } }), {})),
    },
    {
      $project: { _id: 0 },
    },
  ])
  .cursor({ batchSize: 100 })
  .exec();

const justDoIt = async () => {
  const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
  });
  const exists = await client.indices.exists({ index: process.env.ES_INDEX });
  if (!exists) {
    await client.indices.create({ index: process.env.ES_INDEX });
  }
  await createMapping(client)({
    indexType: process.env.ES_TYPE,
    mapping: esMapping,
  });
  return new Promise((resolve) => {
    const indexer = reindexOne(client)({ indexType: process.env.ES_TYPE });
    const stream = getProductsStream(esMapping)();
    stream.on('data', indexer);
    stream.on('end', resolve);
  });
};

justDoIt().then(() => {
  process.exit();
}).catch((err) => {
  console.log(err);
  process.exit(1);
});
