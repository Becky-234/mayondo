const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
//const bcrypt = require("bcryptjs");


// List users (only sales agents)
router.get("/usersList", async (req, res) => {
  try {
    const users = await UserModel.find({ role: 'sales_agent' }).sort({ $natural: -1 });
    res.render("users", { users });
  } catch (err) {
    console.error(err);
    res.status(400).send("Users not found");
  }
});



// Show add-user form
// router.get("/add", (req, res) => {
//   res.render("adduser", { title: "Add user page" });
// });
router.get("/add", (req, res) => {
  res.render("adduser", { title: "Add Sales Agent" });
});

// Handle add-user form
router.post("/add", async (req, res) => {
  try {
    const { name, email, tel, nin, address, username, password, confirmPassword, date } = req.body;

    // Validate required fields
    if (!name || !email || !tel || !nin || !address || !username || !password || !confirmPassword) {
      return res.status(400).send("All fields are required");
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).send("User with this email or username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new sales agent
    const newUser = new UserModel({
      name,
      email,
      tel,
      nin,
      address,
      username,
      password: hashedPassword,
      role: 'sales_agent',
      date: date || new Date()
    });

    await newUser.save();
    res.redirect("/usersList");
  } catch (err) {
    console.error(err);
    res.status(400).send("Failed to create user account");
  }
});

// Handle add-user form
router.post("/add", async (req, res) => {
  try {
    await UserModel.create(req.body);
    res.redirect("/usersList");
  } catch (err) {
    console.error(err);
    res.status(400).send("Failed to save user");
  }
});


// Show edit user form
router.get("/editUser/:id", async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("editUser", { user });
  } catch (error) {
    console.error(error);
    res.status(400).send("Error fetching user");
  }
});


// Handle edit user form submission
router.post("/editUser/:id", async (req, res) => {
  try {
    const { name, email, tel, nin, address, username, password, confirmPassword, date } = req.body;

    // Check if passwords are provided and match
    if (password && password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const updateData = {
      name,
      email,
      tel,
      nin,
      address,
      username,
      date
    };
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.redirect("/usersList");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error updating user");
  }
});


// DELETE user route
router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error deleting user");
  }
});

module.exports = router;