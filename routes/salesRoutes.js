const express = require("express");
const mongoose = require("mongoose");
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
        .sort({ date: -1 }); // Changed from $natural to date for proper sorting
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
        .sort({ date: -1 }); // Changed from $natural to date
    }
    // Fallback for any other cases
    else {
      items = [];
    }

    // Safety check before using items
    if (!items) {
      items = [];
    }

    // Calculate dashboard metrics from actual data
    const totalSalesRaw = items
      .filter(item => item.tproduct === "Raw")
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

    const totalSalesFurniture = items
      .filter(item => item.tproduct === "Furniture")
      .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);

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

    // DEBUG: Check what data is being sent to template
    console.log("=== SALES DATA SENT TO TEMPLATE ===");
    console.log("Number of sales:", items.length);
    if (items.length > 0) {
      console.log("First sale agentName:", items[0].agentName);
      console.log("First sale full data:", JSON.stringify(items[0], null, 2));
    }
    console.log("===================================");

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

//POST sales
router.post("/sales", (req, res) => {
  console.log(req.body);
});

// GET add-sale form - FIXED: Group products to avoid duplicates
router.get("/addSale", ensureAuthenticated, async (req, res) => {
  try {
    // Use aggregation to group products and calculate totals
    const groupedProducts = await StockModel.aggregate([
      {
        $group: {
          _id: "$pdtname",
          pdtname: { $first: "$pdtname" },
          pdttype: { $first: "$pdttype" },
          totalQuantity: { $sum: "$pdtquantity1" },
          availableQuantity: { $sum: "$pdtquantity" },
          costPrice: { $avg: "$cprice" },
          supplier: { $first: "$supplier" },
          quality: { $first: "$quality" }
        }
      },
      {
        $project: {
          _id: 0,
          pdtname: 1,
          pdttype: 1,
          totalQuantity: 1,
          availableQuantity: 1,
          costPrice: 1,
          unitPrice: { $multiply: ["$costPrice", 1.5] }, // Calculate selling price
          supplier: 1,
          quality: 1
        }
      },
      { $sort: { pdtname: 1 } }
    ]);

    // Add stock level information to each product
    const productsWithAlerts = groupedProducts.map(product => {
      let status = "normal";
      let alertMessage = "";

      if (product.availableQuantity === 0) {
        status = "out-of-stock";
        alertMessage = "Out of Stock";
      } else if (product.availableQuantity <= 5) {
        status = "low-stock";
        alertMessage = `Low Stock (${product.availableQuantity} left)`;
      } else if (product.availableQuantity <= 10) {
        status = "medium-stock";
        alertMessage = `Medium Stock (${product.availableQuantity} left)`;
      }

      return {
        ...product,
        stockStatus: status,
        alertMessage: alertMessage
      };
    });

    const success = req.query.success;
    const error = req.query.error;

    res.render("addSale", {
      products: productsWithAlerts, // Changed from 'stocks' to 'products'
      lowStockItems: productsWithAlerts.filter(product => product.availableQuantity <= 5),
      success,
      error,
      currentUser: req.user
    });
  } catch (error) {
    console.error("Error loading sale form:", error.message);
    res.status(500).send("Error loading sale form");
  }
});

// POST add-sale with success/error handling - FIXED: Handle grouped products
router.post("/addSale", ensureAuthenticated, async (req, res) => {
  console.log("POST /addSale hit", req.body);

  try {
    const {
      name, contact, tproduct, nproduct, quantity,
      unitPrice, transportCheck, totalPrice, payment, date
    } = req.body;

    // Check if req.user exists
    if (!req.user || !req.user._id) {
      console.error("req.user:", req.user);
      return res.redirect("/addSale?error=User authentication failed. Please login again.");
    }

    const userId = req.user._id;

    // USE req.user.name - This is the field from your UserModel
    const userName = req.user.name || 'Unknown Agent';

    console.log("2. User ID:", userId, "User Name:", userName);

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

    // Check available stock using aggregation to get total available
    console.log("3. Checking stock for:", { pdtname: nproduct });
    const stockResult = await StockModel.aggregate([
      { $match: { pdtname: nproduct } },
      {
        $group: {
          _id: "$pdtname",
          totalAvailable: { $sum: "$pdtquantity" },
          stockEntries: { $push: "$$ROOT" }
        }
      }
    ]);

    console.log("4. Stock aggregation result:", stockResult);

    if (!stockResult || stockResult.length === 0) {
      console.log("Stock not found for:", nproduct);
      return res.redirect("/addSale?error=Stock not found for the selected product!");
    }

    const totalAvailable = stockResult[0].totalAvailable;
    const stockEntries = stockResult[0].stockEntries;

    console.log("5. Stock quantity check:", { available: totalAvailable, requested: quantity });
    if (totalAvailable < Number(quantity)) {
      console.log("Insufficient stock. Available:", totalAvailable, "Requested:", quantity);
      return res.redirect(`/addSale?error=Insufficient stock! Only ${totalAvailable} units available.`);
    }

    let total = Number(totalPrice);
    console.log("6. Price calculation:", { initialTotal: total, transportCheck: !!transportCheck });

    // TransportCheck
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
      agentName: userName // This will now use req.user.name
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

    console.log("13. Updating stock quantities...");
    // Update stock quantities using FIFO (First In First Out)
    let remainingQuantity = Number(quantity);

    // Sort stock entries by date (oldest first for FIFO)
    const sortedStockEntries = stockEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const stockEntry of sortedStockEntries) {
      if (remainingQuantity <= 0) break;

      const availableInThisBatch = stockEntry.pdtquantity;
      const quantityToDeduct = Math.min(availableInThisBatch, remainingQuantity);

      if (quantityToDeduct > 0) {
        await StockModel.findByIdAndUpdate(
          stockEntry._id,
          { $inc: { pdtquantity: -quantityToDeduct } }
        );
        console.log(`Deducted ${quantityToDeduct} from stock batch ${stockEntry._id}`);
        remainingQuantity -= quantityToDeduct;
      }
    }

    console.log("14. Stock updated successfully. Remaining quantity to deduct:", remainingQuantity);

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

//UPDATING SALES
router.get("/editSales/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    let item = await SalesModel.findById(req.params.id);
    const success = req.query.success;
    const error = req.query.error;

    if (!item) {
      return res.redirect("/sales?error=Sale not found");
    }

    res.render("editSales", { // Make sure this matches .pug filename
      item,
      success,
      error,
      currentUser: req.user
    });
  } catch (error) {
    console.error("Error in editSales GET:", error);
    res.redirect("/sales?error=Sale not found");
  }
});

router.post("/editSales/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    // Check permissions before updating
    const existingSale = await SalesModel.findById(req.params.id);
    if (!existingSale) {
      return res.redirect("/sales?error=Sale not found");
    }

    // Check if user has permission to edit this sale
    const agent = await UserModel.findById(existingSale.agent);
    if (agent.managerId && agent.managerId.toString() !== req.user._id.toString() && existingSale.agent.toString() !== req.user._id.toString()) {
      return res.redirect(`/editSales/${req.params.id}?error=You can only edit sales from your agents`);
    }

    // Prepare update data - convert types as needed
    const updateData = {
      name: req.body.name,
      contact: req.body.contact,
      nproduct: req.body.nproduct,
      tproduct: req.body.tproduct,
      quantity: Number(req.body.quantity),
      unitPrice: req.body.unitPrice, // Keep as string if your schema expects string
      transportCheck: req.body.transportCheck === 'on',
      totalPrice: req.body.totalPrice, // Keep as string if your schema expects string
      payment: req.body.payment,
      date: req.body.date
      // Don't update agent or agentName - keep original values
    };

    console.log("Update data:", updateData);

    const product = await SalesModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.redirect("/sales?error=Sale not found");
    }

    res.redirect("/sales?success=Sale updated successfully!");
  } catch (error) {
    console.error("Edit sale error:", error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.redirect(`/editSales/${req.params.id}?error=${encodeURIComponent("Validation: " + errors.join(', '))}`);
    }

    // Handle cast errors
    if (error.name === 'CastError') {
      return res.redirect(`/editSales/${req.params.id}?error=Invalid sale ID`);
    }

    res.redirect(`/editSales/${req.params.id}?error=Error updating sale: ${encodeURIComponent(error.message)}`);
  }
});

// DELETING SALES - Only managers can delete
router.post("/deleteSale", ensureManager, async (req, res) => {
  try {
    const result = await SalesModel.deleteOne({ _id: req.body.id });

    if (result.deletedCount === 0) {
      return res.redirect("/sales?error=Sale not found");
    }

    res.redirect("/sales?success=Sale deleted successfully!");
  } catch (error) {
    console.error(error);
    res.redirect("/sales?error=Unable to delete sale from the database");
  }
});

// GENERATING RECEIPT
router.post("/getReceipt/:id", ensureAuthenticated, async (req, res) => {
  try {
    const item = await SalesModel.findOne({ _id: req.params.id });

    if (!item) {
      return res.status(404).send('Sale not found');
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