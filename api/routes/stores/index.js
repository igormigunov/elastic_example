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
  .route('/search')
  .get(celebrate(validators.search), async (req, res) => {
    try {
      const rawQuery = {
        from: req.query.limit * (req.query.page - 1),
        size: req.query.limit,
        query: {
          bool: {
            must: {
              query_string: {
                query: req.query.q.trim(),
                default_operator: 'AND',
              },
            },
          },
        },
      };

      StoreModel.esSearch(
        rawQuery, {
          hydrate: true,
          hydrateWithESResults: true,
          hydrateOptions: { lean: true },
        },
        (err, results) => {
          if (err) return res.status(400).send(err);
          res.send(results.hits);
        },
      );
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
