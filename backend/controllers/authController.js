const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================
const registerUser = async (req, res) => {

  try {

    console.log("REGISTER API HIT");

    const { name, email, password } = req.body;

    console.log("BODY:", req.body);

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists"
      });

    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("USER CREATED:", user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= LOGIN =================
const loginUser = async (req, res) => {

  try {

    console.log("LOGIN API HIT");

    console.log("BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {

      return res.status(404).json({
        message: "Invalid Email"
      });

    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid Password"
      });

    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

};


// ================= FORGOT PASSWORD =================
const forgetPassword = async (req, res) => {

  try {

    console.log("FORGOT PASSWORD API HIT");

    console.log("BODY:", req.body);

    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    console.log("USER FOUND:", user);

    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    console.log("PASSWORD UPDATED");

    res.status(200).json({
      message: "Password Updated Successfully"
    });

  } catch (error) {

    console.log("FORGOT PASSWORD ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  }

};




// ================= CREATE STAFF =================
const createStaff = async (req, res) => {
  try {

    const { name, email, password, role } = req.body;

    if (
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "staff"
    });

    res.status(201).json({
      message: "Staff Created Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// ================= EXPORT =================
module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
   createStaff
};