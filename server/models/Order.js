// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: String,
  email: String,
  address: String,
  items: Array,
  total: Object,
  orderId: String,
  date: String,
  isRead: { type: Boolean, default: false },
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
