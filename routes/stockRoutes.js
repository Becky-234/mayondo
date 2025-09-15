const express = require("express");
const router = express.Router();

const StockModel = require("../models/stockModel");

//Stock page
//GETTING THE STOCK FROM THE DATABASE
router.get("/stock", async (req, res) => {
  try {
    let items = await StockModel.find().sort({ $natural: -1 });
    console.log(items);
    res.render("stock", {items});
  } catch (error) {
    res.status(400).send("Unable to get data from the database");
  }
});

router.post("/stock", (req, res) => {
  console.log(req.body);
});


//Add stock page
router.get("/addStock", (req, res) => {
  res.render("addStock", { title: "Stock page" });
});

router.post("/addStock", async (req, res) => {
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

module.exports = router;
