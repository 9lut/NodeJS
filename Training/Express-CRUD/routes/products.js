var express = require('express');
var router = express.Router();
var Product = require('../models/product.model');
var verifyToken = require('../midleware/auth');

// ดึงรายการสินค้าทั้งหมด
router.get('/', async function(req, res) {
    try {
        const products = await Product.find().populate('createdBy', 'name email');
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ดึงรายการสินค้าตาม ID
router.get('/:id', async function(req, res) {
    try {
        const product = await Product.findById(req.params.id).populate('createdBy', 'name email');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// เพิ่มสินค้าใหม่ (ต้องมี Token)
router.post('/', verifyToken, async function(req, res) {
    try {
        const { name, price, description } = req.body;
        const newProduct = new Product({
            name,
            price,
            description,
            createdBy: req.user.id // เอา id ของคนที่สร้างมาจาก token
        });
        
        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// แก้ไขข้อมูลสินค้า (ต้องมี Token)
router.put('/:id', verifyToken, async function(req, res) {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// ลบข้อมูลสินค้า (ต้องมี Token)
router.delete('/:id', verifyToken, async function(req, res) {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
