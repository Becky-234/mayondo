const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const { ensureAuthenticated, ensureManager } = require("../middleware/auth")


// List users (only sales agents)
router.get("/usersList", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const users = await UserModel.find({ role: 'sales_agent' }).sort({ $natural: -1 });

    const success = req.query.success;
    const error = req.query.error;

    res.render("users", {
      users,
      success,
      error,
      currentUser: req.user // ← ADD THIS LINE
    });
  } catch (err) {
    console.error(err);
    res.status(400).send("Users not found");
  }
});

// Show add-user form
router.get("/add", (req, res) => {
  const success = req.query.success;
  const error = req.query.error;

  res.render("adduser", {
    title: "Add Sales Agent",
    success,
    error
  });
});

// Handle add-user form
router.post("/add", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    console.log("Received form data:", req.body);

    const { name, email, tel, nin, address, username, password, confirmPassword, date } = req.body;

    // Validate required fields
    if (!name || !email || !tel || !nin || !address || !username || !password || !confirmPassword || !date) {
      console.log("Missing fields detected");
      return res.redirect("/add?error=" + encodeURIComponent("All fields are required"));
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      console.log("Passwords don't match");
      return res.redirect("/add?error=" + encodeURIComponent("Passwords do not match"));
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.redirect("/add?error=" + encodeURIComponent("User with this email or username already exists"));
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

    res.redirect("/usersList?success=" + encodeURIComponent("User added successfully!"));
  } catch (err) {
    console.error("Detailed error:", err);

    if (err.code === 11000) {
      return res.redirect("/add?error=" + encodeURIComponent("User with this email or username already exists"));
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(error => error.message);
      return res.redirect("/add?error=" + encodeURIComponent(errors.join(', ')));
    }

    res.redirect("/add?error=" + encodeURIComponent("Failed to create user account: " + err.message));
  }
});

// Show edit user form
router.get("/editUser/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    let user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.redirect("/usersList?error=" + encodeURIComponent("User not found"));
    }

    const success = req.query.success;
    const error = req.query.error;

    res.render("editUser", {
      user,
      success,
      error
    });
  } catch (error) {
    console.error(error);
    res.redirect("/usersList?error=" + encodeURIComponent("Error fetching user"));
  }
});

// Handle edit user form submission
router.post("/editUser/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const { name, email, tel, nin, address, username, password, confirmPassword, date } = req.body;

    // Check if passwords are provided and match
    if (password && password !== confirmPassword) {
      return res.redirect(`/editUser/${req.params.id}?error=` + encodeURIComponent("Passwords do not match"));
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
      return res.redirect("/usersList?error=" + encodeURIComponent("User not found"));
    }

    res.redirect("/usersList?success=" + encodeURIComponent("User updated successfully!"));
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.redirect(`/editUser/${req.params.id}?error=` + encodeURIComponent(errors.join(', ')));
    }

    res.redirect(`/editUser/${req.params.id}?error=` + encodeURIComponent("Error updating user"));
  }
});


// In UserRoutes.js
router.post("/deleteUser/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    console.log("Deleting user with ID:", req.params.id);

    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.redirect("/usersList?error=User not found");
    }

    res.redirect("/usersList?success=User deleted successfully!");
  } catch (error) {
    console.error("Delete error:", error);
    res.redirect("/usersList?error=Error deleting user");
  }
});


module.exports = router;