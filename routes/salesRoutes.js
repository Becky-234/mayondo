const express = require("express");
const router = express.Router();
const SalesModel = require("../models/salesModel");
const StockModel = require("../models/stockModel");
const { ensureAuthenticated, ensureAgent } = require("../middleware/auth")


// GET /sales – fetch sales from DB and render the page
router.get("/sales", async (req, res) => {
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
    const success = req.query.success;
    const error = req.query.error;

    res.render('sales', {
      items,
      currentUser,
      success,
      error,
      dashboardMetrics: {
        totalSalesRaw: Math.round(totalSalesRaw),
        totalSalesFurniture: Math.round(totalSalesFurniture),
        totalSalesAll: Math.round(totalSalesRaw + totalSalesFurniture),
        totalOrders,
        totalSoldRaw,
        totalSoldFurniture,
        totalSoldAll: totalSoldRaw + totalSoldFurniture,
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
//STOCK ALERTS
// GET add-sale form
// GET add-sale form with success/error messages
router.get("/addSale", async (req, res) => {
  try {
    const stocks = await StockModel.find();
    const success = req.query.success;
    const error = req.query.error;

    // Add stock level information to each product
    const stocksWithAlerts = stocks.map(stock => {
      let status = "normal";
      let alertMessage = "";

      if (stock.pdtquantity === 0) {
        status = "out-of-stock";
        alertMessage = "Out of Stock";
      } else if (stock.pdtquantity <= 5) {
        status = "low-stock";
        alertMessage = `Low Stock (${stock.pdtquantity} left)`;
      } else if (stock.pdtquantity <= 10) {
        status = "medium-stock";
        alertMessage = `Medium Stock (${stock.pdtquantity} left)`;
      }

      return {
        ...stock.toObject(),
        stockStatus: status,
        alertMessage: alertMessage
      };
    });

    res.render("addSale", {
      stocks: stocksWithAlerts,
      lowStockItems: stocks.filter(stock => stock.pdtquantity <= 5),
      success,
      error
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error loading sale form");
  }
});


//Only if you are logged in as a sales agent, you will be able to make a sale
//ensureAuthenticated, ensureAgent,
// POST add-sale with success/error handling
router.post("/addSale", async (req, res) => {
  console.log("POST /addSale hit", req.body);
  try {
    const {
      name, contact, tproduct, nproduct, quantity,
      unitPrice, transportCheck, totalPrice, payment, date
    } = req.body;
    const userId = req.session.user._id;

    const stock = await StockModel.findOne({ pdtname: nproduct, pdttype: tproduct });
    if (!stock) {
      return res.redirect("/addSale?error=Stock not found for the selected product!");
    }

    if (stock.pdtquantity < Number(quantity)) {
      return res.redirect(`/addSale?error=Insufficient stock! Only ${stock.pdtquantity} units available.`);
    }

    let total = Number(totalPrice);
    if (transportCheck) total *= 1.05;

    // Ensure the contact starts with +256
    let formattedContact = contact.trim();
    if (!formattedContact.startsWith("+256")) {
      formattedContact = "+256" + formattedContact.replace(/^0+/, "");
    }

    if (stock && stock.pdtquantity > 0) {
      const sale = new SalesModel({
        name,
        contact: formattedContact,
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

      await sale.save();

      // Decrease Quantity from the stock collection
      stock.pdtquantity -= quantity;
      await stock.save();

      res.redirect("/sales?success=Sale completed successfully!");
    } else {
      return res.redirect("/addSale?error=Product is currently out of stock!");
    }

  } catch (error) {
    console.error(error);
    res.redirect("/addSale?error=Error processing sale. Please try again.");
  }
});


//UPDATING SALES
// UPDATING SALES with messages
router.get("/editSales/:id", async (req, res) => {
  try {
    const item = await SalesModel
      .findById(req.params.id)
      .populate("agent", "name");
    const success = req.query.success;
    const error = req.query.error;

    if (!item) {
      return res.status(404).send("Sale not found");
    }

    res.render("editSales", {
      item,
      success,
      error
    });
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
      return res.redirect(`/editSales/${req.params.id}?error=Sale not found`);
    }
    res.redirect("/sales?success=Sale updated successfully!");
  } catch (error) {
    res.redirect(`/editSales/${req.params.id}?error=Error updating sale`);
  }
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
    res.status(400).send('Uable to find sale')
  }
});

module.exports = router;
