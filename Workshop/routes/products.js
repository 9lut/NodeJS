var express = require("express");
var router = express.Router();
const Product = require("../models/Product.Model.js");
const Order = require("../models/Order.Model.js");
const {
  authenticateToken,
  isShopOrAdmin,
} = require("../middleware/auth");
const upload = require("../middleware/upload");
const rateLimit = require("express-rate-limit");

const productLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 429,
    message: "Too many requests. Please try again later.",
    data: null,
  },
});

// [GET] /api/v1/products
router.get("/", productLimiter, async (req, res) => {
  try {
    // Only return active products to everyone
    const products = await Product.find({ isActive: true }).populate(
      "shop",
      "username role",
    );
    res.status(200).json({
      status: 200,
      message: "success",
      data: products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: [],
    });
  }
});

// [GET] /api/v1/products/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("shop", "username role");
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or inactive",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: "success",
      data: product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

// [POST] /api/v1/products
router.post("/", authenticateToken, isShopOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    // Assign the creator (shop/admin) as the product's shop
    const newProduct = new Product({
      name,
      description,
      price,
      stock,
      shop: req.user.id,
      image: req.file ? '/images/products/' + req.file.filename : ''
    });

    await newProduct.save();
    res.status(201).json({
      status: 201,
      message: "success",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

// [PUT] /api/v1/products/:id
router.put("/:id", authenticateToken, isShopOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or inactive",
        data: null,
      });
    }

    // Check ownership: Must be Admin OR the Shop that owns this product
    if (req.user.role !== "admin" && product.shop.toString() !== req.user.id) {
      return res.status(403).json({
        status: 403,
        message: "Access Denied: You do not own this product",
        data: null,
      });
    }

    const { name, description, price, stock } = req.body;
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;

    if (req.file) {
        product.image = '/images/products/' + req.file.filename;
    }

    await product.save();

    res.status(200).json({
      status: 200,
      message: "success",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

// [DELETE] /api/v1/products/:id (Soft Delete)
router.delete("/:id", authenticateToken, isShopOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or already inactive",
        data: null,
      });
    }

    // Check ownership: Must be Admin OR the Shop that owns this product
    if (req.user.role !== "admin" && product.shop.toString() !== req.user.id) {
      return res.status(403).json({
        status: 403,
        message: "Access Denied: You do not own this product",
        data: null,
      });
    }

    // Soft Delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      status: 200,
      message: "success",
      data: product,
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

// [GET] /api/v1/products/:id/orders
router.get(
  "/:id/orders",
  authenticateToken,
  isShopOrAdmin,
  async (req, res) => {
    try {
      // Optional: Check if user owns the product before showing orders
      const product = await Product.findById(req.params.id);
      if (
        product &&
        req.user.role !== "admin" &&
        product.shop.toString() !== req.user.id
      ) {
        return res.status(403).json({
          status: 403,
          message: "Access Denied: You do not own this product",
          data: null,
        });
      }

      const orders = await Order.find({ product: req.params.id }).populate(
        "user",
        "-password",
      );
      res.status(200).json({
        status: 200,
        message: "success",
        data: orders,
      });
    } catch (error) {
      console.error("Get Product Orders Error:", error);
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        data: [],
      });
    }
  },
);

// [POST] /api/v1/products/:id/orders
router.post("/:id/orders", authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        status: 400,
        message: "Invalid quantity",
        data: null,
      });
    }

    // Only active products can be ordered
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found or inactive",
        data: null,
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: 400,
        message: `Insufficient stock. Available stock: ${product.stock}`,
        data: null,
      });
    }

    const totalPrice = product.price * quantity;

    const newOrder = new Order({
      product: productId,
      user: req.user.id,
      quantity,
      totalPrice,
    });

    // Save order and deduct stock
    await newOrder.save();
    product.stock -= quantity;
    await product.save();

    res.status(201).json({
      status: 201,
      message: "บันทึก Order",
      data: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
});

module.exports = router;
