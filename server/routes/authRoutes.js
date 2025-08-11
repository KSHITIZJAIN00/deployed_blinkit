// import express from "express";
// // import bcryptjs instead of bcrypt
// import bcrypt from 'bcryptjs';

// import User from "../models/User.js";

// const router = express.Router();

// // Signup Route
// router.post("/signup", async (req, res) => {
//   const { email, password, isAdmin } = req.body; // Allow setting admin status

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({ 
//       email, 
//       password: hashedPassword, 
//       isAdmin: isAdmin || false // Default to false
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });

// // Login Route
// // Login Route
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Log user data to ensure it's correct
//     console.log("User data:", user);

//     // Respond with both the message and user data
//     res.status(200).json({ 
//       message: "Login successful",  
//       user: { 
//         email: user.email,
//         isAdmin: user.isAdmin  // Send isAdmin flag with the user data
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// });


// export default router;

// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

// Nodemailer transporter setup with your Gmail account
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kshitizagrawal001@gmail.com",
    pass: "xisp zcgl ktze zfgp", // ⚠️ Use App Password from Google
  },
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });
    await user.save();

    // Send welcome email
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #FFE600; padding: 15px; text-align: center;">
            <h2 style="margin: 0; color: #333;">🎉 Welcome to Our Platform</h2>
          </div>
          <div style="padding: 20px; text-align: center;">
            <p style="font-size: 16px; color: #555;">
              Hello <strong>${name}</strong>,  
              Thank you for signing up! We’re excited to have you onboard.
            </p>
            <p style="font-size: 14px; color: #999;">You can now log in using your email and password.</p>
            <div style="margin-top: 30px;">
              <a href="${process.env.FRONTEND_URI || "http://localhost:5174"}" style="text-decoration: none; background-color: #FFE600; padding: 10px 20px; border-radius: 5px; color: black; font-weight: bold;">Go to Login</a>
            </div>
          </div>
          <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Your Company. All rights reserved.
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Our Platform" <kshitizagrawal001@gmail.com>`,
      to: email,
      subject: "Welcome to Our Platform 🎉",
      html: htmlTemplate,
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user existence
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, "jwtsecretkey", {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

