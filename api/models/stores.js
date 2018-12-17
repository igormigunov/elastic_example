const Mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const mongoosastic = require('mongoosastic');
const timestamp = require('mongoose-timestamp');

const storeSchema = new Mongoose.Schema({
  id: { type: Number },
  name: { type: String, es_indexed: true },
  address: { type: String, es_indexed: true },
  phone: { type: String },
});

storeSchema.plugin(mongoosastic);

storeSchema.plugin(mongooseDelete, { overrideMethods: true, validateBeforeDelete: true });
storeSchema.plugin(timestamp);


module.exports = Mongoose.model('Store', storeSchema);
