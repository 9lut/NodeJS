const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.model');
const Product = require('./models/product.model');
const Order = require('./models/order.model');

async function seedData() {
    try {
        const { DB_HOST, DB_PORT, DB_NAME } = process.env;
        await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);
        console.log("Connected to MongoDB for seeding...");

        // เคลียร์ข้อมูลเก่า (Optional - จะคอมเม้นต์ไว้เผื่อไม่อยากลบของเก่า)
        // await User.deleteMany();
        // await Product.deleteMany();
        // await Order.deleteMany();

        // 1. สร้าง User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        const user = new User({
            name: "John Admin",
            age: 30,
            email: "admin@example.com",
            password: hashedPassword,
            status: "active"
        });
        const savedUser = await user.save();
        console.log("✅ สร้าง User ตัวอย่างเรียบร้อย");

        // 2. สร้าง Product
        const product = new Product({
            name: "MacBook Pro M3",
            price: 59000,
            description: "แล็ปท็อปประสิทธิภาพสูง",
            createdBy: savedUser._id
        });
        const savedProduct = await product.save();
        console.log("✅ สร้าง Product ตัวอย่างเรียบร้อย");

        // 3. สร้าง Order
        const order = new Order({
            productId: savedProduct._id,
            count: 2
        });
        await order.save();
        console.log("✅ สร้าง Order ตัวอย่างเรียบร้อย");

        console.log("🎉 เพิ่มข้อมูลตัวอย่างทั้งหมดสำเร็จ! ให้ไปกด Refresh ใน MongoDB Compass ได้เลยครับ");
        
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seedData();
