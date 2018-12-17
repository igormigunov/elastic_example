const Mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const timestamp = require('mongoose-timestamp');

const storeSchema = new Mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  address: { type: String },
  phone: { type: String },
});

storeSchema.plugin(mongooseDelete, { overrideMethods: true, validateBeforeDelete: true });
storeSchema.plugin(timestamp);


module.exports = Mongoose.model('Store', storeSchema);
