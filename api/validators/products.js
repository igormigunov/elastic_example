const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);
const stores = require('../../mocks/stores');

const productJoiObject = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  quantity: Joi.number(),
}).options({ stripUnknown: true });

module.exports = {
  getList: {
    query: Joi.object({
      name: Joi.string(),
      store: Joi.string().valid(stores.map(it => it.name)),
      barcode: Joi.number().positive(),
      quantity_from: Joi.number(),
      quantity_to: Joi.number(),
    }).options({ stripUnknown: true }),
  },
  post: {
    body: productJoiObject.requiredKeys(['name', 'description', 'quantity']).options({ stripUnknown: true }),
  },
  search: {
    query: Joi.object({
      q: Joi.string().required(),
      page: Joi.number().default(1),
      limit: Joi.number().default(10),
    }).options({ stripUnknown: true }),
  },
};
