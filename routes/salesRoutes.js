const express = require("express");
const router = express.Router();
const SalesModel = require("../models/salesModel");

// GET /sales – fetch sales from DB and render the page
router.get("/sales", async (req, res) => {
  try {
    const items = await SalesModel.find().sort({ $natural: -1 });
    console.log(items);
    res.render("sales", { items });
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

router.post("/addSale", async (req, res) => {
  try {
    const sale = new SalesModel(req.body);
    await sale.save();
    res.redirect("/sales");
  } catch (error) {
    console.error(error);
    res.redirect("/addSale");
  }
});

module.exports = router;
