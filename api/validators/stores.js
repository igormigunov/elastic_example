const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const storeJoiObject = Joi.object({
  id: Joi.number().positive(),
  name: Joi.string(),
  address: Joi.string(),
  phone: Joi.string(),
}).options({ stripUnknown: true });

module.exports = {
  getlist: {
    query: storeJoiObject.options({ stripUnknown: true }),
  },
  getById: {
    params: Joi.object({
      storeId: Joi.objectId(),
    }).options({ stripUnknown: true }),
  },
  post: {
    body: storeJoiObject.requiredKeys(['id', 'name']).options({ stripUnknown: true }),
  },
  patchOne: {
    params: Joi.object({
      storeId: Joi.objectId(),
    }).options({ stripUnknown: true }),
    body: storeJoiObject.options({ stripUnknown: true }),
  },
  search: {
    query: Joi.object({
      q: Joi.string().required(),
      page: Joi.number().default(1),
      limit: Joi.number().default(10),
    }).options({ stripUnknown: true }),
  },
};
