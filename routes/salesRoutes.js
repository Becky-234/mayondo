const express = require("express");
const router = express.Router();
const SalesModel = require("../models/salesModel");
const { ensureAuthenticated, ensureAgent } = require("../middleware/auth")

// GET /sales – fetch sales from DB and render the page
router.get("/sales", async (req, res) => {
  try {
    const items = await SalesModel.find().sort({ $natural: -1 });
    console.log(items);
    res.render("sales", {
      items,
      currentUser: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Unable to get sales");
  }
});

router.post("/sales", (req, res) => {
  console.log(req.body);
});

// GET add-sale form
router.get("/addSale", (req, res) => {
  res.render("addSale", { title: "Add sales page" });
});
//Only if you are logged in as a sales agent, you will be able to make a sale
//ensureAuthenticated, ensureAgent,
router.post("/addSale", async (req, res) => {
  try {
    const { name, tproduct, nproduct, quantity, unitPrice, transportCheck, totalPrice, payment, date
    } = req.body;
    const userId = req.session.user._id;
    const sale = new SalesModel({
      name,
      tproduct,
      nproduct,
      quantity,
      unitPrice,
      transportCheck,
      totalPrice,
      payment,
      date,
      agent: userId
    });
    console.log(req.body);
    await sale.save();
    res.redirect("/sales");
  } catch (error) {
    console.error(error);
    res.redirect("/addSale");
  }
});

//UPDATING SALES
router.get("/editSales/:id", async (req, res) => {
  let item = await SalesModel.findById(req.params.id);
  res.render(`editSales`, { item });
});

router.post("/editSales/:id", async (req, res) => {
  try {
    const product = await SalesModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.redirect("/sales");
  } catch (error) { }
});

//DELETING SALES
router.post("/deleteSale", async (req, res) => {
  try {
    await SalesModel.deleteOne({ _id: req.body.id });
    res.redirect("sales");
  } catch (error) {
    res.status(400).send("Unable to delete item from the database");
  }
});

module.exports = router;
