import express from "express";
// import bcryptjs instead of bcrypt
import bcrypt from 'bcryptjs';

import User from "../models/User.js";

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, password, isAdmin } = req.body; // Allow setting admin status

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ 
      email, 
      password: hashedPassword, 
      isAdmin: isAdmin || false // Default to false
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Login Route
// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log user data to ensure it's correct
    console.log("User data:", user);

    // Respond with both the message and user data
    res.status(200).json({ 
      message: "Login successful",  
      user: { 
        email: user.email,
        isAdmin: user.isAdmin  // Send isAdmin flag with the user data
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});


export default router;
