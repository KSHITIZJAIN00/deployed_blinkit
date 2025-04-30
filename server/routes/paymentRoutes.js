import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Razorpay instance with env variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Sanitize function to remove emojis and special characters
const sanitizeString = (str) => {
  return str.replace(/[^\w\s]/gi, '').trim();
};

// @route   POST /api/payment/razor
// @desc    Create Razorpay order
router.post("/razor", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Should be { amount: 16000 }

    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      return res.status(400).json({
        success: false,
        error: "Amount must be a number and is required.",
      });
    }

    console.log("Amount received:", amount);

    const options = {
      amount, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1,
    };

    console.log("Creating order with:");
    console.log("Amount:", amount);
    console.log("Currency: INR");
    console.log("Key ID:", process.env.RAZORPAY_KEY_ID);

    // Attempt to create the order
    const order = await razorpay.orders.create(options);
    console.log("Razorpay Order Created:", order);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      error: "Server error. Could not create order. Please try again later.",
    });
  }
});

export default router;
