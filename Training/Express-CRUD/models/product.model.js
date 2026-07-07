const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = mongoose.model('Product', productSchema);