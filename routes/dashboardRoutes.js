const express = require('express');
const router = express.Router();
const StockModel = require("../models/stockModel");
const SalesModel = require("../models/salesModel");
const { ensureAuthenticated, ensureManager } = require("../middleware/auth")

// Dashboard Page with Product Type Separation
router.get('/dashboard', ensureAuthenticated, ensureManager, async (req, res) => {
    try {
        // Use req.session.user instead of req.user
        const currentUser = req.session.user || req.user;

        if (!currentUser) {
            console.log("No user found in session");
            return res.redirect('/login');
        }

        console.log("Dashboard user data:", {
            username: currentUser.username,
            role: currentUser.role,
            source: req.session.user ? 'session' : 'req.user'
        });

        // Fetch all stock items
        const stockItems = await StockModel.find({});

        // Initialize metrics for different product types
        let metrics = {
            total: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                lowStockItems: [] // ADD THIS: to store low stock items
            },
            rawMaterials: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                items: [],
                lowStockItems: [] // ADD THIS
            },
            furniture: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                items: [],
                lowStockItems: [] // ADD THIS
            }
        };

        stockItems.forEach(item => {
            const sellingPrice = item.cprice * 1.5;
            const itemRevenue = sellingPrice * item.pdtquantity;
            const itemCost = item.cprice * item.pdtquantity;
            const itemProfit = itemRevenue - itemCost;

            // Determine product type
            const productType = item.pdttype.toLowerCase().includes('raw') ? 'rawMaterials' :
                item.pdttype.toLowerCase().includes('furniture') ? 'furniture' : 'other';

            // Check if item has low stock (less than 10)
            const isLowStock = item.pdtquantity < 10;

            // Update total metrics
            metrics.total.revenue += itemRevenue;
            metrics.total.profit += itemProfit;
            metrics.total.inventoryCount++;
            metrics.total.totalItems += item.pdtquantity;
            metrics.total.inventoryValue += itemCost;

            if (isLowStock) {
                metrics.total.stockWarnings++;
                // ADD low stock item to the array
                metrics.total.lowStockItems.push({
                    name: item.pdtname,
                    quantity: item.pdtquantity,
                    type: item.pdttype,
                    threshold: 10
                });
            }

            // Update specific product type metrics
            if (metrics[productType]) {
                metrics[productType].revenue += itemRevenue;
                metrics[productType].profit += itemProfit;
                metrics[productType].inventoryCount++;
                metrics[productType].totalItems += item.pdtquantity;
                metrics[productType].inventoryValue += itemCost;
                metrics[productType].items.push(item);

                if (isLowStock) {
                    metrics[productType].stockWarnings++;
                    // ADD low stock item to the specific category
                    metrics[productType].lowStockItems.push({
                        name: item.pdtname,
                        quantity: item.pdtquantity,
                        type: item.pdttype,
                        threshold: 10
                    });
                }
            }
        });

        // Format the data for the template
        const dashboardData = {
            // Total metrics
            totalRevenue: Math.round(metrics.total.revenue).toLocaleString(),
            totalProfit: Math.round(metrics.total.profit).toLocaleString(),
            totalInventory: metrics.total.inventoryCount,
            totalStockWarnings: metrics.total.stockWarnings,
            totalItems: metrics.total.totalItems,
            totalInventoryValue: Math.round(metrics.total.inventoryValue).toLocaleString(),
            totalLowStockItems: metrics.total.lowStockItems, // ADD THIS

            // Raw Materials metrics
            rawRevenue: Math.round(metrics.rawMaterials.revenue).toLocaleString(),
            rawProfit: Math.round(metrics.rawMaterials.profit).toLocaleString(),
            rawInventory: metrics.rawMaterials.inventoryCount,
            rawStockWarnings: metrics.rawMaterials.stockWarnings,
            rawItems: metrics.rawMaterials.totalItems,
            rawInventoryValue: Math.round(metrics.rawMaterials.inventoryValue).toLocaleString(),
            rawLowStockItems: metrics.rawMaterials.lowStockItems, // ADD THIS

            // Furniture metrics
            furnitureRevenue: Math.round(metrics.furniture.revenue).toLocaleString(),
            furnitureProfit: Math.round(metrics.furniture.profit).toLocaleString(),
            furnitureInventory: metrics.furniture.inventoryCount,
            furnitureStockWarnings: metrics.furniture.stockWarnings,
            furnitureItems: metrics.furniture.totalItems,
            furnitureInventoryValue: Math.round(metrics.furniture.inventoryValue).toLocaleString(),
            furnitureLowStockItems: metrics.furniture.lowStockItems, // ADD THIS

            // Percentages
            rawPercentage: metrics.total.inventoryCount > 0 ?
                Math.round((metrics.rawMaterials.inventoryCount / metrics.total.inventoryCount) * 100) : 0,
            furniturePercentage: metrics.total.inventoryCount > 0 ?
                Math.round((metrics.furniture.inventoryCount / metrics.total.inventoryCount) * 100) : 0
        };

        console.log("Low stock items found:", {
            total: dashboardData.totalLowStockItems.length,
            raw: dashboardData.rawLowStockItems.length,
            furniture: dashboardData.furnitureLowStockItems.length
        });

        res.render('dashboard', {
            currentUser: currentUser,
            dashboardData: dashboardData
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const currentUser = req.session.user || req.user;
        res.render('dashboard', {
            currentUser: currentUser,
            dashboardData: getDefaultDashboardData()
        });
    }
});

function getDefaultDashboardData() {
    return {
        totalRevenue: '0',
        totalProfit: '0',
        totalInventory: '0',
        totalStockWarnings: '0',
        totalItems: '0',
        totalInventoryValue: '0',
        totalLowStockItems: [], // ADD THIS
        rawRevenue: '0',
        rawProfit: '0',
        rawInventory: '0',
        rawStockWarnings: '0',
        rawItems: '0',
        rawInventoryValue: '0',
        rawLowStockItems: [], // ADD THIS
        furnitureRevenue: '0',
        furnitureProfit: '0',
        furnitureInventory: '0',
        furnitureStockWarnings: '0',
        furnitureItems: '0',
        furnitureInventoryValue: '0',
        furnitureLowStockItems: [], // ADD THIS
        rawPercentage: 0,
        furniturePercentage: 0
    };
}

router.post('/dashboard', ensureAuthenticated, ensureManager, (req, res) => {
    console.log(req.body);
});

module.exports = router;