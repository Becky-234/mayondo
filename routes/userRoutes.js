const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const methodOverride = require('method-override');


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
router.get("/add", (req, res) => {
  res.render("adduser", { title: "Add Sales Agent" });
});


// Handle add-user form
router.post("/add", async (req, res) => {
  try {
    console.log("Received form data:", req.body);

    const { name, email, tel, nin, address, username, password, confirmPassword, date } = req.body;

    // Validate required fields
    if (!name || !email || !tel || !nin || !address || !username || !password || !confirmPassword || !date) {
      console.log("Missing fields detected");
      return res.status(400).render("adduser", {
        error: "All fields are required",
        title: "Add Sales Agent"
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords don't match");
      return res.status(400).render("adduser", {
        error: "Passwords do not match",
        title: "Add Sales Agent"
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(400).render("adduser", {
        error: "User with this email or username already exists",
        title: "Add Sales Agent"
      });
    }

    // Create new sales agent - password will be hashed by the model
    const newUser = new UserModel({
      name,
      email,
      tel,
      nin,
      address,
      username,
      password, // Store plain password - model will hash it
      role: 'sales_agent',
      date: date
    });

    console.log("Attempting to save user:", newUser);
    await newUser.save();
    console.log("User saved successfully");

    res.redirect("/usersList");
  } catch (err) {
    console.error("Detailed error:", err);

    if (err.code === 11000) {
      return res.status(400).render("adduser", {
        error: "User with this email or username already exists",
        title: "Add Sales Agent"
      });
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.status(400).render("adduser", {
        error: errors.join(', '),
        title: "Add Sales Agent"
      });
    }

    res.status(400).render("adduser", {
      error: "Failed to create user account: " + err.message,
      title: "Add Sales Agent"
    });
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
      const user = await UserModel.findById(req.params.id);
      return res.render("editUser", {
        user,
        error: "Passwords do not match"
      });
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
      updateData.password = password;
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
    const user = await UserModel.findById(req.params.id);
    res.render("editUser", {
      user,
      error: "Error updating user: " + error.message
    });
  }
});


// DELETE user route
router.post("/deleteUser/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.redirect("/usersList");
  } catch (error) {
    console.error(error);
    res.status(400).send("Error deleting user");
  }
});

module.exports = router;