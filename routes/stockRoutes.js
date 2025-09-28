const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureManager } = require("../middleware/auth")
const StockModel = require("../models/stockModel");

// Stock page - GET with success/error messages
router.get("/stock", ensureAuthenticated, async (req, res) => {
  try {
    let items = await StockModel
      .find()
      .sort({ $natural: -1 });

    const success = req.query.success;
    const error = req.query.error;

    console.log(items);
    res.render("stock", {
      items,
      success,
      error,
      currentUser: req.user // Pass current user to template
    });
  } catch (error) {
    res.status(400).send("Unable to get data from the database");
  }
});

router.post("/stock", ensureAuthenticated, (req, res) => {
  console.log(req.body);
});

// Add stock page - GET with messages
router.get("/addStock", ensureManager, (req, res) => {
  const success = req.query.success;
  const error = req.query.error;

  res.render("addStock", {
    title: "Stock page",
    success,
    error,
    currentUser: req.user // Pass current user to template
  });
});

// Add stock - POST
router.post("/addStock", ensureManager, async (req, res) => {
  try {
    const stock = new StockModel(req.body);
    console.log(req.body);
    await stock.save();
    res.redirect("/stock?success=Stock item added successfully!");
  } catch (error) {
    console.error(error);

    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.redirect(`/addStock?error=${encodeURIComponent(errors.join(', '))}`);
    }

    res.redirect("/addStock?error=Unable to add stock item. Please try again.");
  }
});


// Updating stock - GET with messages
router.get("/editStock/:id", ensureManager, async (req, res) => {
  try {
    let item = await StockModel.findById(req.params.id);
    const success = req.query.success;
    const error = req.query.error;

    if (!item) {
      return res.redirect("/stock?error=Stock item not found");
    }

    res.render("editStock", { // Make sure this matches your .pug filename
      item,
      success,
      error,
      currentUser: req.user
    });
  } catch (error) {
    console.error("Error in editStock GET:", error);
    res.redirect("/stock?error=Stock item not found");
  }
});


// Updating stock - POST with messages
router.post("/editStock/:id", ensureManager, async (req, res) => {
  try {
    const product = await StockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Added runValidators
    );

    if (!product) {
      return res.redirect("/stock?error=Stock item not found");
    }

    res.redirect("/stock?success=Stock item updated successfully!");
  } catch (error) {
    console.error(error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.redirect(`/editStock/${req.params.id}?error=${encodeURIComponent(errors.join(', '))}`);
    }

    res.redirect(`/editStock/${req.params.id}?error=Error updating stock item`);
  }
});

// Deleting stock with messages
router.post("/deleteStock", ensureManager, async (req, res) => {
  try {
    const result = await StockModel.deleteOne({ _id: req.body.id });

    if (result.deletedCount === 0) {
      return res.redirect("/stock?error=Stock item not found");
    }

    res.redirect("/stock?success=Stock item deleted successfully!");
  } catch (error) {
    console.error(error);
    res.redirect("/stock?error=Unable to delete stock item from the database");
  }
});

// Generating receipt - Only authenticated users
router.post("/generateReceipt/:id", ensureAuthenticated, async (req, res) => {
  try {
    const item = await StockModel.findOne({ _id: req.params.id });

    if (!item) {
      return res.status(404).send('Stock item not found');
    }

    res.render("stockReceipt", {
      item,
      currentUser: req.user // Pass current user to template
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to find stock item');
  }
});

module.exports = router;