const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const boom = require('express-boom');
const logger = require('morgan');
const docgen = require('node-api-swagger-docgen');
const { errors } = require('celebrate');
const config = require('../package.json');
const storeRoute = require('./routes/stores');
const productRoute = require('./routes/products');

const app = express();

app.lib = {
  models: {
    stores: require('./models/stores'),
    products: require('./models/products'),
  },
};

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

app.use(logger('dev'));
app.set('port', process.env.PORT);
app.use(compression());
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(boom());
app.use(express.static(`${__dirname}/swagger`));
app.get('/', (req, res) => {
  res.render('/swagger/index.html');
});
app.get('/version', (req, res) => res.send({ name: config.name, version: config.version }));
app.use('/v1/stores', storeRoute);
app.use('/v1/products', productRoute);
app.use(errors());
app.use((req, res) => {
  res.boom.notFound();
});
app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});
docgen.generate(app);
module.exports = app;
