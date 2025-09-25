const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureManager } = require("../middleware/auth")

const StockModel = require("../models/stockModel");

//Stock page
//GETTING THE STOCK FROM THE DATABASE
router.get("/stock", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    let items = await StockModel.find().sort({ $natural: -1 });
    console.log(items);
    res.render("stock", { items });
  } catch (error) {
    res.status(400).send("Unable to get data from the database");
  }
});
router.post("/stock", ensureAuthenticated, ensureManager, (req, res) => {
  console.log(req.body);
});

//Add stock page
router.get("/addStock", ensureAuthenticated, ensureManager, (req, res) => {
  res.render("addStock", { title: "Stock page" });
});
router.post("/addStock", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const stock = new StockModel(req.body);
    console.log(req.body);
    await stock.save();
    res.redirect("/stock");
  } catch (error) {
    console.error(error);
    res.redirect("/addStock");
  }
});

//UPDATING STOCK
router.get("/editStock/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  let item = await StockModel.findById(req.params.id);
  //console.log(item)
  res.render(`editStock`, { item });
});
router.post("/editStock/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const product = await StockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.redirect("/stock");
  } catch (error) { }
});

//DELETING STOCK
router.post("/deleteStock", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    await StockModel.deleteOne({ _id: req.body.id });
    res.redirect("/stock");
  } catch (error) {
    res.status(400).send("Unable to delete item from the database");
  }
});

//GENERATING RECEIPT
router.post("/generateReceipt/:id", async (req, res) => {
  try {
    const item = await StockModel.findOne({ _id: req.params.id });
    res.render("stockReceipt", { item });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to find stock')
  }
});



module.exports = router;
