const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureManager } = require("../middleware/auth")

const StockModel = require("../models/stockModel");

//Stock page
//GETTING THE STOCK FROM THE DATABASE
//ensureAuthenticated, ensureManager,
// Stock page - GET with success/error messages
router.get("/stock", async (req, res) => {
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
      currentUser: req.user
    });
  } catch (error) {
    res.status(400).send("Unable to get data from the database");
  }
});


//ensureAuthenticated, ensureManager,
router.post("/stock", (req, res) => {
  console.log(req.body);
});

// Add stock page - GET with messages
router.get("/addStock", (req, res) => {
  const success = req.query.success;
  const error = req.query.error;

  res.render("addStock", {
    title: "Stock page",
    success,
    error
  });
});


//Add stock page
//ensureAuthenticated, ensureManager,
router.get("/addStock", (req, res) => {
  const success = req.query.success;
  const error = req.query.error;

  res.render("addStock", { title: "Stock page" });
  title: "Stock page",
    success,
    error
});

//ensureAuthenticated, ensureManager,
router.post("/addStock", async (req, res) => {
  try {
    const stock = new StockModel(req.body);
    console.log(req.body);
    await stock.save();
    res.redirect("/stock?success=Stock item added successfully!");
  } catch (error) {
    console.error(error);
    res.redirect("/addStock?error=Unable to add stock item. Please try again.");
  }
});


//UPDATING STOCK
//ensureAuthenticated, ensureManager,
// Updating stock - GET with messages
router.get("/editStock/:id", async (req, res) => {
  try {
    let item = await StockModel.findById(req.params.id);
    const success = req.query.success;
    const error = req.query.error;

    res.render(`editStock`, {
      item,
      success,
      error
    });
  } catch (error) {
    res.redirect("/stock?error=Stock item not found");
  }
});

//ensureAuthenticated, ensureManager,
// Updating stock - POST with messages
router.post("/editStock/:id", async (req, res) => {
  try {
    const product = await StockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.redirect("/stock?error=Stock item not found");
    }
    res.redirect("/stock?success=Stock item updated successfully!");
  } catch (error) {
    res.redirect(`/editStock/${req.params.id}?error=Error updating stock item`);
  }
});


//DELETING STOCK
//ensureAuthenticated, ensureManager,
// Deleting stock with messages
router.post("/deleteStock", async (req, res) => {
  try {
    await StockModel.deleteOne({ _id: req.body.id });
    res.redirect("/stock?success=Stock item deleted successfully!");
  } catch (error) {
    res.redirect("/stock?error=Unable to delete stock item from the database");
  }
});


//GENERATING RECEIPT
router.post("/generateReceipt/:id", async (req, res) => {
  try {
    const item = await StockModel.findOne({ _id: req.params.id });
    res.render("stockReceipt", { item });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Uable to find stock')
  }
});



module.exports = router;
