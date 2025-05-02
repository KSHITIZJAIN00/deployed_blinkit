import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// POST - Save order
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Order saved." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save order." });
  }
});

// GET - Admin fetches new orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

export default router;
