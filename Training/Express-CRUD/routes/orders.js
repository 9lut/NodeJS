var express = require('express');
var router = express.Router();
var Order = require('../models/order.model');
var Product = require('../models/product.model');
var verifyToken = require('../midleware/auth');

// ดึงรายการสั่งซื้อทั้งหมด (ต้องมี Token)
router.get('/', verifyToken, async function(req, res) {
    try {
        const orders = await Order.find().populate('productId');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ดึงรายการสั่งซื้อตาม ID (ต้องมี Token)
router.get('/:id', verifyToken, async function(req, res) {
    try {
        const order = await Order.findById(req.params.id).populate('productId');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// สร้างคำสั่งซื้อใหม่ (ต้องมี Token)
router.post('/', verifyToken, async function(req, res) {
    try {
        const { productId, count } = req.body;

        // ตรวจสอบว่ามีสินค้านี้จริงหรือไม่
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const newOrder = new Order({
            productId,
            count: count || 1
        });
        
        await newOrder.save();
        res.status(201).json({ success: true, message: 'Order created successfully', data: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// แก้ไขคำสั่งซื้อ (ต้องมี Token)
router.put('/:id', verifyToken, async function(req, res) {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, message: 'Order updated successfully', data: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ลบคำสั่งซื้อ (ต้องมี Token)
router.delete('/:id', verifyToken, async function(req, res) {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
