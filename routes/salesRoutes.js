const express = require("express");
const router = express.Router();
const SalesModel = require("../models/salesModel");
const StockModel = require("../models/stockModel");
const { ensureAuthenticated, ensureAgent } = require("../middleware/auth")


// GET /sales – fetch sales from DB and render the page
router.get("/sales", ensureAuthenticated, async (req, res) => {
  try {
    const items = await SalesModel
      .find()
      .sort({ $natural: -1 })
      .populate("agent", "name");

    // Calculate dashboard metrics from actual data - SEPARATED BY TYPE
    const totalSalesRaw = items
      .filter(item => item.tproduct === "Raw")
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const totalSalesFurniture = items
      .filter(item => item.tproduct === "Furniture")
      .reduce((sum, item) => sum + item.totalPrice, 0);

    const totalOrders = items.length;

    // Calculate total sold products by type
    const totalSoldRaw = items
      .filter(item => item.tproduct === "Raw")
      .reduce((sum, item) => sum + item.quantity, 0);

    const totalSoldFurniture = items
      .filter(item => item.tproduct === "Furniture")
      .reduce((sum, item) => sum + item.quantity, 0);

    const currentUser = req.session.user;

    res.render('sales', {
      items,
      currentUser,
      dashboardMetrics: {
        totalSalesRaw: Math.round(totalSalesRaw),
        totalSalesFurniture: Math.round(totalSalesFurniture),
        totalSalesAll: Math.round(totalSalesRaw + totalSalesFurniture), // Optional: keep total
        totalOrders,
        totalSoldRaw,
        totalSoldFurniture,
        totalSoldAll: totalSoldRaw + totalSoldFurniture, // Optional: keep total
      }
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
router.get("/addSale", async (req, res) => {
  try {
    const stocks = await StockModel.find()
    res.render("addSale", { stocks });
  } catch (error) {
    console.error(error.message)
  }
});
//Only if you are logged in as a sales agent, you will be able to make a sale
router.post("/addSale", ensureAuthenticated, ensureAgent, async (req, res) => {
  console.log("POST /addSale hit", req.body);
  try {
    const {
      name, contact, tproduct, nproduct, quantity,
      unitPrice, transportCheck, totalPrice, payment, date
    } = req.body;
    const userId = req.session.user._id;

    const stock = await StockModel.findOne({ pdtname: nproduct, pdttype: tproduct });
    if (!stock) {
      return res.status(400).send('Stock not Found!');
    }

    if (stock.pdtquantity < Number(quantity)) {
      return res.status(400).send('Low Stock!');
    }

    let total = Number(totalPrice);
    if (transportCheck) total *= 1.05;

    // Ensure the contact starts with +256
    let formattedContact = contact.trim();
    if (!formattedContact.startsWith("+256")) {
      // remove any leading zeros or existing country code before adding +256
      formattedContact = "+256" + formattedContact.replace(/^0+/, "");
    }

    if (stock && stock.pdtquantity > 0) {
      const sale = new SalesModel({
        name,
        contact: formattedContact,   // <---- use the formatted value
        tproduct,
        nproduct,
        quantity,
        unitPrice,
        transportCheck: !!transportCheck,
        totalPrice: total,
        payment,
        date,
        agent: userId,
      });
      console.log('Saving sale', sale);
      console.log(userId);
      await sale.save();

      //Decrease Qantity from the stock collection
      stock.pdtquantity -= quantity
      console.log('New quantity after sale', stock.pdtquantity);
      await stock.save();
      res.redirect("/sales");
    } else {
      return res.status(400).send('Product sold out')
    }

  } catch (error) {
    console.error(error);
    res.redirect("/addSale");
  }
});


//UPDATING SALES
router.get("/editSales/:id", async (req, res) => {
  try {
    const item = await SalesModel
      .findById(req.params.id)
      .populate("agent", "name"); // populate the agent name

    if (!item) {
      return res.status(404).send("Sale not found");
    }

    res.render("editSales", { item });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading sale");
  }
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
    res.redirect("/sales");
  } catch (error) {
    res.status(400).send("Unable to delete item from the database");
  }
});


//GENERATING RECEIPT
router.post("/getReceipt/:id", async (req, res) => {
  // console.log('Receipt route hit with ID:', req.params.id);
  try {
    const item = await SalesModel.findOne({ _id: req.params.id });
    // console.log('Item found:', item);
    res.render("salesReceipt", { item });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to find sale')
  }
});

module.exports = router;
