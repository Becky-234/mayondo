const express = require("express");
const router = express.Router();
const SalesModel = require("../models/salesModel");
const StockModel = require("../models/stockModel");
const UserModel = require("../models/userModel");
const { ensureAuthenticated, ensureAgent, ensureManager } = require("../middleware/auth");

// GET /sales – fetch sales from DB and render the page
router.get("/sales", ensureAuthenticated, async (req, res) => {
  try {

    console.log("User role in sales route:", req.user.role);
    console.log("User data:", req.user);

    let items;

    // If user is Sales Agent, only show their sales
    if (req.user.role === 'sales_agent') {
      items = await SalesModel
        .find({ agent: req.user._id })
        .sort({ $natural: -1 })
        .populate("agent", "fullName");
    }
    // If user is Manager, show sales from their agents
    else if (req.user.role === 'manager') {
      // Get all sales agents managed by this manager
      const managedAgents = await UserModel.find({
        managerId: req.user._id
      }).select('_id');

      const agentIds = managedAgents.map(agent => agent._id);
      agentIds.push(req.user._id); // Include manager's own sales if any

      items = await SalesModel
        .find({ agent: { $in: agentIds } })
        .sort({ $natural: -1 })
        .populate("agent", "fullName");
    }
    // Fallback for any other cases
    else {
      items = []; // Initialize as empty array to prevent undefined errors
    }

    // Safety check before using items
    if (!items) {
      items = [];
    }

    // Calculate dashboard metrics from actual data
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

    const success = req.query.success;
    const error = req.query.error;

    res.render('sales', {
      items,
      currentUser: req.user,
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

// GET add-sale form
router.get("/addSale", ensureAuthenticated, ensureAgent, async (req, res) => {

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
      error,
      currentUser: req.user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error loading sale form");
  }
});

// POST add-sale with success/error handling
router.post("/addSale", ensureAuthenticated, ensureAgent, async (req, res) => {
  console.log("=== START ADD SALE PROCESS ===");
  console.log("POST /addSale hit", req.body);

  // DEBUG: Check if req.user exists
  console.log("DEBUG - req.user:", req.user);
  console.log("DEBUG - req.session:", req.session);

  try {
    const {
      name, contact, tproduct, nproduct, quantity,
      unitPrice, transportCheck, totalPrice, payment, date
    } = req.body;

    console.log("1. Parsed request body:", {
      name, contact, tproduct, nproduct, quantity,
      unitPrice, transportCheck, totalPrice, payment, date
    });

    // Check if req.user exists - ADD THIS SAFETY CHECK
    if (!req.user || !req.user._id) {
      console.error("ERROR: req.user is undefined or missing _id");
      console.error("req.user:", req.user);
      return res.redirect("/addSale?error=User authentication failed. Please login again.");
    }

    const userId = req.user._id;
    console.log("2. User ID:", userId);

    // Validate required fields
    if (!name || !contact || !tproduct || !nproduct || !quantity || !unitPrice || !payment || !date) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!contact) missingFields.push('contact');
      if (!tproduct) missingFields.push('tproduct');
      if (!nproduct) missingFields.push('nproduct');
      if (!quantity) missingFields.push('quantity');
      if (!unitPrice) missingFields.push('unitPrice');
      if (!payment) missingFields.push('payment');
      if (!date) missingFields.push('date');

      console.log("Missing fields:", missingFields);
      return res.redirect("/addSale?error=Missing required fields: " + missingFields.join(', '));
    }

    // Check if stock exists
    console.log("3. Looking for stock:", { pdtname: nproduct, pdttype: tproduct });
    const stock = await StockModel.findOne({ pdtname: nproduct, pdttype: tproduct });
    console.log("4. Found stock:", stock ? stock.pdtname : "NOT FOUND");

    if (!stock) {
      console.log("Stock not found for:", nproduct, tproduct);
      return res.redirect("/addSale?error=Stock not found for the selected product!");
    }

    console.log("5. Stock quantity check:", { available: stock.pdtquantity, requested: quantity });
    if (stock.pdtquantity < Number(quantity)) {
      console.log("Insufficient stock. Available:", stock.pdtquantity, "Requested:", quantity);
      return res.redirect(`/addSale?error=Insufficient stock! Only ${stock.pdtquantity} units available.`);
    }

    let total = Number(totalPrice);
    console.log("6. Price calculation:", { initialTotal: total, transportCheck: !!transportCheck });

    // Fix transportCheck - it's coming as undefined, so check the actual value
    const hasTransport = transportCheck === 'on' || transportCheck === true;
    if (hasTransport) {
      total *= 1.05;
      console.log("Total with transport:", total);
    }

    // Ensure the contact starts with +256
    let formattedContact = contact.trim();
    console.log("7. Contact formatting:", { original: contact, formatted: formattedContact });

    if (!formattedContact.startsWith("+256")) {
      // Remove any spaces and ensure proper format
      formattedContact = "+256" + formattedContact.replace(/^0+/, "").replace(/\s/g, "");
      console.log("Formatted contact:", formattedContact);
    }

    console.log("8. Creating sale object...");
    const saleData = {
      name: name.trim(),
      contact: formattedContact,
      tproduct: tproduct.trim(),
      nproduct: nproduct.trim(),
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      transportCheck: hasTransport,
      totalPrice: total,
      payment: payment.trim(),
      date: new Date(date),
      agent: userId,
    };

    console.log("9. Sale data to be saved:", saleData);

    const sale = new SalesModel(saleData);

    console.log("10. Validating sale...");
    try {
      await sale.validate();
      console.log("Sale validation passed");
    } catch (validationError) {
      console.error("Sale validation failed:", validationError);
      return res.redirect("/addSale?error=Validation: " + encodeURIComponent(validationError.message));
    }

    console.log("11. Saving sale to database...");
    await sale.save();
    console.log("12. Sale saved successfully with ID:", sale._id);

    console.log("13. Updating stock quantity...");
    // Decrease Quantity from the stock collection
    stock.pdtquantity -= Number(quantity);
    await stock.save();
    console.log("14. Stock updated successfully. New quantity:", stock.pdtquantity);

    console.log("=== SALE PROCESS COMPLETED SUCCESSFULLY ===");
    res.redirect("/sales?success=Sale completed successfully!");

  } catch (error) {
    console.error("=== ERROR IN SALE PROCESS ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error("Mongoose validation errors:", errors);
      return res.redirect("/addSale?error=" + encodeURIComponent("Validation: " + errors.join(', ')));
    }

    res.redirect("/addSale?error=Error processing sale: " + encodeURIComponent(error.message));
  }
});


// UPDATING SALES with messages - Only managers can edit
router.get("/editSales/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const item = await SalesModel
      .findById(req.params.id)
      .populate("agent", "fullName");

    if (!item) {
      return res.status(404).send("Sale not found");
    }

    // Check if manager can edit this sale (only their agents' sales)
    const agent = await UserModel.findById(item.agent);
    if (agent.managerId.toString() !== req.user._id.toString() && item.agent.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only edit sales from your agents");
    }

    const success = req.query.success;
    const error = req.query.error;

    res.render("editSales", {
      item,
      success,
      error,
      currentUser: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading sale");
  }
});

router.post("/editSales/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    // Check permissions before updating
    const existingSale = await SalesModel.findById(req.params.id);
    const agent = await UserModel.findById(existingSale.agent);
    if (agent.managerId.toString() !== req.user._id.toString() && existingSale.agent.toString() !== req.user._id.toString()) {
      return res.redirect(`/editSales/${req.params.id}?error=You can only edit sales from your agents`);
    }

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

// DELETING SALES - Only managers can delete
router.post("/deleteSale", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    // Check permissions before deleting
    const sale = await SalesModel.findById(req.body.id);
    const agent = await UserModel.findById(sale.agent);
    if (agent.managerId.toString() !== req.user._id.toString() && sale.agent.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only delete sales from your agents");
    }

    await SalesModel.deleteOne({ _id: req.body.id });
    res.redirect("/sales?success=Sale deleted successfully!");
  } catch (error) {
    res.redirect("/sales?error=Unable to delete sale");
  }
});

// GENERATING RECEIPT
router.post("/getReceipt/:id", ensureAuthenticated, async (req, res) => {
  try {
    const item = await SalesModel.findOne({ _id: req.params.id });

    // Check permissions for receipt access
    if (req.user.role === 'sales_agent' && item.agent.toString() !== req.user._id.toString()) {
      return res.status(403).send("You can only view receipts for your own sales");
    }

    if (req.user.role === 'manager') {
      const agent = await UserModel.findById(item.agent);
      if (agent.managerId.toString() !== req.user._id.toString() && item.agent.toString() !== req.user._id.toString()) {
        return res.status(403).send("You can only view receipts for your agents' sales");
      }
    }

    res.render("salesReceipt", {
      item,
      currentUser: req.user
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).send('Unable to find sale');
  }
});

module.exports = router;