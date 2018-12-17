const router = require('express').Router();
const _ = require('lodash');
const { celebrate } = require('celebrate');
const validators = require('../../validators/products');
const ProductModel = require('../../models/products');
const StoreModel = require('../../models/stores');


const getRouter = ({ elasticClient }) => {
  router
    .route('/')
    .get(celebrate(validators.getList), async (req, res) => {
      try {
        const { quantity_from: qFrom, quantity_to: qTo, store } = req.query;
        const filter = _.omit(req.query, ['quantity_from', 'quantity_to', 'store']);
        const qFilter = _.omitBy(_.assign({},
          qFrom && qTo && { $and: [{ quantity: { $gte: qFrom } }, { quantity: { $lte: qTo } }] },
          qFrom && !qTo && { quantity: { $gte: qFrom } },
          qTo && !qFrom && { quantity: { $lte: qTo } }), _.isUndefined);
        const storeFilter = await (store
          ? StoreModel.findOne({ name: store }).then(d => (d ? { store: d._id } : {}))
          : {});
        Object.assign(filter, qFilter, storeFilter);
        const result = await ProductModel.find(filter);
        res.send(result);
      } catch (err) {
        res.boom.badRequest(err);
      }
    })
    .post(celebrate(validators.post), async (req, res) => {
      try {
        const stores = await StoreModel.find();
        const lastBarcode = await ProductModel.findOne().sort({ barcode: -1 })
          .then(d => (d ? d.barcode : 0));
        const result = await Promise.all(stores.map(store => ProductModel.create(_.assign({},
          req.body, { store, barcode: (lastBarcode + 1) }))));
        res.status(201).send(result);
      } catch (err) {
        res.boom.badRequest(err);
      }
    });
  router
    .route('/search')
    .get(celebrate(validators.search), async (req, res) => {
      try {
        const rawQuery = {
          index: process.env.ES_INDEX,
          from: req.query.limit * (req.query.page - 1),
          size: req.query.limit,
          body: {
            query: {
              bool: {
                must: {
                  query_string: {
                    query: req.query.q.trim(),
                  },
                },
              },
            },
          },
        };
        const result = await elasticClient.search(rawQuery);
        res.send(_.map(_.result(result, 'hits.hits'), '_source'));
      } catch (err) {
        res.boom.badRequest(err);
      }
    });
  router
    .route('/searchMongo')
    .get(celebrate(validators.search), async (req, res) => {
      try {
        const filter = {
          $or: [{ name: new RegExp(`${req.query.q}`, 'i') },
            { description: new RegExp(`${req.query.q}`, 'i') },
            { barcode: new RegExp(`${req.query.q}`, 'i') },
          ],
        };
        const fields = ['barcode', 'name', 'description'];
        const result = await ProductModel.aggregate([
          { $match: filter },
          {
            $group: Object.assign({
              _id: '$barcode',

            }, fields.reduce((r, key) => Object.assign(r, { [key]: { $first: `$${key}` } }), {})),
          },
          {
            $project: { _id: 0 },
          },
          { $skip: (req.query.page - 1) * req.query.limit },
          { $limit: req.query.limit },
        ]);
        res.send(result);
      } catch (err) {
        res.boom.badRequest(err);
      }
    });
  return router;
};
module.exports = getRouter;
