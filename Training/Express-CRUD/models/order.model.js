const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    
    count: { type: Number, required: true, default: 1 }
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);