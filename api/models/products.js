const Mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const timestamp = require('mongoose-timestamp');

const ObjectId = Mongoose.Schema.Types.ObjectId;


const productSchema = new Mongoose.Schema({
  name: { type: String },
  description: { type: String },
  barcode: { type: Number },
  quantity: { type: Number, default: 0 },
  store: { type: ObjectId, ref: 'Store' },
});

productSchema.plugin(mongooseDelete, { overrideMethods: true, validateBeforeDelete: true });
productSchema.plugin(timestamp);

module.exports = Mongoose.model('Product', productSchema);
