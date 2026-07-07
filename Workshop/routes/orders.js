var express = require("express");
var router = express.Router();
const Order = require("../models/Order.Model.js");
const Product = require("../models/Product.Model.js");
const { authenticateToken, isShopOrAdmin } = require("../middleware/auth");

// [GET] /api/v1/orders
router.get("/", authenticateToken, isShopOrAdmin, async (req, res) => {
  try {
    let orders;

    if (req.user.role === "admin") {
      // Admin: See all orders
      orders = await Order.find()
        .populate("product")
        .populate("user", "-password");
    } else {
      const shopProducts = await Product.find({ shop: req.user.id });
      const productIds = shopProducts.map((p) => p._id);
      orders = await Order.find({ product: { $in: productIds } })
        .populate("product")
        .populate("user", "-password");
    }

    const detailedOrders = orders.map(order => {
      return {
        orderId: order._id,
        purchasedAt: order.createdAt,
        buyer: order.user ? {
          userId: order.user._id,
          username: order.user.username
        } : null,
        productDetails: order.product ? {
          productId: order.product._id,
          name: order.product.name,
          pricePerUnit: order.product.price,
          currentRemainingStock: order.product.stock
        } : null,
        orderedQuantity: order.quantity, // จำนวนที่ลูกค้าซื้อ
        totalPrice: order.totalPrice
      };
    });

    res.status(200).json({
      status: 200,
      message: "success",
      data: detailedOrders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: [],
    });
  }
});

module.exports = router;
