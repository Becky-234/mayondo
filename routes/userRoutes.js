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

module.exports = router;
