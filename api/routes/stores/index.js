const router = require('express').Router();
const { celebrate } = require('celebrate');
const validators = require('../../validators/stores');
const StoreModel = require('../../models/stores');

router
  .route('/')
  .get(celebrate(validators.getlist), async (req, res) => {
    try {
      const result = await StoreModel.find(req.query);
      res.send(result);
    } catch (err) {
      res.boom.badRequest(err);
    }
  })
  .post(celebrate(validators.post), async (req, res) => {
    try {
      const result = await StoreModel.create(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.boom.badRequest(err);
    }
  });
router
  .route('/:storeId')
  .get(celebrate(validators.getById), async (req, res) => {
    try {
      const store = await StoreModel.findById(req.params.storeId);
      if (!store) res.boom.notFound();
      res.send(store);
    } catch (err) {
      res.boom.badRequest(err);
    }
  })
  .patch(celebrate(validators.patchOne), async (req, res) => {
    const store = await StoreModel.findByIdAndUpdate(req.params.storeId, req.body);
    if (!store) res.boom.notFound();
    res.send(store);
  });
module.exports = router;
