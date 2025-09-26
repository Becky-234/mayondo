const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");

// List users
router.get("/usersList", async (req, res) => {
  try {
    const users = await UserModel.find().sort({ $natural: -1 });
    res.render("users", { users });
  } catch (err) {
    console.error(err);
    res.status(400).send("Users not found");
  }
});

router.post("/usersList", (req, res) => {
  res.render("users");
})

// Show add-user form
router.get("/add", (req, res) => {
  res.render("adduser", { title: "Add user page" });
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
    const { name, email, tel, username, role } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { name, email, tel, username, role },
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
router.post("/deleteUser/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.redirect("/usersList");  // Redirect after deletion
  } catch (error) {
    console.error(error);
    res.status(400).send("Error deleting user");
  }
});

// Alternative GET route for delete (if you prefer using links instead of forms)
// router.get("/deleteUser/:id", async (req, res) => {
//   try {
//     const user = await UserModel.findByIdAndDelete(req.params.id);
//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     res.redirect("/usersList");
//   } catch (error) {
//     console.error(error);
//     res.status(400).send("Error deleting user");
//   }
// });

module.exports = router;