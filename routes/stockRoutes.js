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
      error
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
    error
  });
});


// Add stock - POST
router.post("/addStock", ensureManager, async (req, res) => {
  try {
    const { pdtname, pdttype, pdtquantity1, pdtquantity, cprice, supplier, supplierContact, quality, date } = req.body;

    // Calculate product price automatically (50% markup)
    const calculatedPrice = Math.round(cprice * 1.5);

    const stock = new StockModel({
      pdtname,
      pdttype,
      pdtquantity1,
      pdtquantity,
      cprice,
      pdtprice: calculatedPrice, // Use the calculated price
      supplier,
      supplierContact,
      quality,
      date
    });

    console.log('Adding stock with calculated price:', {
      costPrice: cprice,
      productPrice: calculatedPrice
    });

    await stock.save();
    res.redirect("/stock?success=Stock item added successfully!");
  } catch (error) {
    console.error(error);

    // Handling specific validation errors
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

    res.render("editStock", {
      item,
      success,
      error
    });
  } catch (error) {
    console.error("Error in editStock GET:", error);
    res.redirect("/stock?error=Stock item not found");
  }
});


// Updating stock - POST with messages
router.post("/editStock/:id", ensureManager, async (req, res) => {
  try {
    const { cprice, ...otherFields } = req.body;

    // Recalculate product price when cost price changes
    const calculatedPrice = Math.round(cprice * 1.5);

    const updateData = {
      ...otherFields,
      cprice,
      pdtprice: calculatedPrice // Update the calculated price
    };

    const product = await StockModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
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



// Generating receipt
router.post("/generateReceipt/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const item = await StockModel.findOne({ _id: req.params.id });

    if (!item) {
      return res.status(404).send('Stock item not found');
    }

    res.render("stockReceipt", {
      item
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to find stock item');
  }
});

module.exports = router;