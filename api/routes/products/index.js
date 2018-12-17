const router = require('express').Router();
const _ = require('lodash');
const { celebrate } = require('celebrate');
const validators = require('../../validators/products');
const ProductModel = require('../../models/products');
const StoreModel = require('../../models/stores');

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
module.exports = router;
