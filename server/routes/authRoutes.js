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
import express from "express";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();
let otpStore = {}; // Temporary store

// Use environment variables for security (replace with actual env vars in production)
const EMAIL_USER =  "kshitizagrawal001@gmail.com";
const EMAIL_PASS =  "xisp zcgl ktze zfgp";

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// STEP 1: Login and send OTP
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: Invalid credentials for ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #FFE600; padding: 15px; text-align: center;">
            <h2 style="margin: 0; color: #333;">🔐 Login Verification</h2>
          </div>
          <div style="padding: 20px; text-align: center;">
            <p style="font-size: 16px; color: #555;">
              Hello <strong>${user.name || "User"}</strong>,  
              Use the following OTP to complete your login:
            </p>
            <h1 style="font-size: 36px; color: #000; margin: 20px 0;">${otp}</h1>
            <p style="font-size: 14px; color: #999;">This OTP will expire in <strong>5 minutes</strong>.</p>
            <div style="margin-top: 30px;">
              <a href="https://blinkify-kj7a.onrender.com" style="text-decoration: none; background-color: #FFE600; padding: 10px 20px; border-radius: 5px; color: black; font-weight: bold;">Go to Login</a>
            </div>
          </div>
          <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #777;">
            © ${new Date().getFullYear()} Blinkify. All rights reserved.
          </div>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Blinkify" <${EMAIL_USER}>`,
        to: email,
        subject: "Your Login OTP",
        html: htmlTemplate,
      });
      console.log(`OTP sent to ${email}: ${otp}`);
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    setTimeout(() => delete otpStore[email], 5 * 60 * 1000);

    res.status(200).json({ message: "OTP sent to email", email });
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// STEP 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!otpStore[email] || otpStore[email] !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    delete otpStore[email];
    const user = await User.findOne({ email });

    res.status(200).json({
      message: "OTP verified, login successful",
      user: {
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Verify OTP route error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup route error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});


export default router;
