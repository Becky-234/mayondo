const express = require('express');
const router = express.Router();
const StockModel = require("../models/stockModel");
const SalesModel = require("../models/salesModel");
const { ensureAuthenticated, ensureManager } = require("./authMiddleware");  // ← FIXED PATH

// Dashboard Page with Product Type Separation
router.get('/dashboard', ensureAuthenticated, ensureManager, async (req, res) => {
    try {
        const currentUser = req.user;  // ← USE req.user, not req.session.user

        if (!currentUser) {
            console.log("No user found in session");
            return res.redirect('/login');
        }

        // Rest of your code remains the same...
        // Fetching all stock items
        const stockItems = await StockModel.find({});

        // Grouping items by product name to match stock table logic
        const groupedItems = {};
        stockItems.forEach(item => {
            if (!groupedItems[item.pdtname]) groupedItems[item.pdtname] = [];
            groupedItems[item.pdtname].push(item);
        });

        // Initialize metrics
        let metrics = {
            total: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                criticalWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                lowStockItems: [],
                criticalStockItems: []
            },
            rawMaterials: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                criticalWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                lowStockItems: [],
                criticalStockItems: []
            },
            furniture: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                criticalWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                lowStockItems: [],
                criticalStockItems: []
            }
        };

        // Process each product group (like stock table)
        Object.keys(groupedItems).forEach(productName => {
            const productGroup = groupedItems[productName];

            // Calculate totals for this product group
            const totalQuantity = productGroup.reduce((sum, item) => sum + parseInt(item.pdtquantity1 || 0), 0);
            const availableQuantity = productGroup.reduce((sum, item) => sum + parseInt(item.pdtquantity || 0), 0);

            // Calculate revenue and profit for the group
            let groupRevenue = 0;
            let groupProfit = 0;
            let groupInventoryValue = 0;

            productGroup.forEach(item => {
                const sellingPrice = item.cprice * 1.5;
                const itemRevenue = sellingPrice * item.pdtquantity;
                const itemCost = item.cprice * item.pdtquantity;
                const itemProfit = itemRevenue - itemCost;

                groupRevenue += itemRevenue;
                groupProfit += itemProfit;
                groupInventoryValue += itemCost;
            });

            // Determine product type from first item in group
            const productType = productGroup[0].pdttype.toLowerCase().includes('raw') ? 'rawMaterials' :
                productGroup[0].pdttype.toLowerCase().includes('furniture') ? 'furniture' : 'other';

            // MATCH STOCK TABLE LOGIC - Check totals, not individual items
            const isCriticalStock = availableQuantity < 5; // CRITICAL: total available < 5
            const isLowStock = availableQuantity < 10 && availableQuantity >= 5; // LOW: total available 5-9

            // Update total metrics
            metrics.total.revenue += groupRevenue;
            metrics.total.profit += groupProfit;
            metrics.total.inventoryCount++;
            metrics.total.totalItems += totalQuantity;
            metrics.total.inventoryValue += groupInventoryValue;

            if (isCriticalStock) {
                metrics.total.criticalWarnings++;
                metrics.total.criticalStockItems.push({
                    name: productName,
                    quantity: availableQuantity,
                    type: productGroup[0].pdttype,
                    threshold: 5,
                    status: 'critical'
                });
            } else if (isLowStock) {
                metrics.total.stockWarnings++;
                metrics.total.lowStockItems.push({
                    name: productName,
                    quantity: availableQuantity,
                    type: productGroup[0].pdttype,
                    threshold: 10,
                    status: 'low'
                });
            }

            // Update specific product type metrics
            if (metrics[productType]) {
                metrics[productType].revenue += groupRevenue;
                metrics[productType].profit += groupProfit;
                metrics[productType].inventoryCount++;
                metrics[productType].totalItems += totalQuantity;
                metrics[productType].inventoryValue += groupInventoryValue;

                if (isCriticalStock) {
                    metrics[productType].criticalWarnings++;
                    metrics[productType].criticalStockItems.push({
                        name: productName,
                        quantity: availableQuantity,
                        type: productGroup[0].pdttype,
                        threshold: 5,
                        status: 'critical'
                    });
                } else if (isLowStock) {
                    metrics[productType].stockWarnings++;
                    metrics[productType].lowStockItems.push({
                        name: productName,
                        quantity: availableQuantity,
                        type: productGroup[0].pdttype,
                        threshold: 10,
                        status: 'low'
                    });
                }
            }
        });

        // Calculate total warnings (low + critical)
        const totalAllWarnings = metrics.total.stockWarnings + metrics.total.criticalWarnings;
        const rawAllWarnings = metrics.rawMaterials.stockWarnings + metrics.rawMaterials.criticalWarnings;
        const furnitureAllWarnings = metrics.furniture.stockWarnings + metrics.furniture.criticalWarnings;

        // Format the data for the template
        const dashboardData = {
            // Total metrics
            totalRevenue: Math.round(metrics.total.revenue).toLocaleString(),
            totalProfit: Math.round(metrics.total.profit).toLocaleString(),
            totalInventory: metrics.total.inventoryCount,
            totalStockWarnings: totalAllWarnings,
            totalCriticalWarnings: metrics.total.criticalWarnings,
            totalItems: metrics.total.totalItems,
            totalInventoryValue: Math.round(metrics.total.inventoryValue).toLocaleString(),
            totalLowStockItems: [...metrics.total.lowStockItems, ...metrics.total.criticalStockItems],

            // Raw Materials metrics
            rawRevenue: Math.round(metrics.rawMaterials.revenue).toLocaleString(),
            rawProfit: Math.round(metrics.rawMaterials.profit).toLocaleString(),
            rawInventory: metrics.rawMaterials.inventoryCount,
            rawStockWarnings: rawAllWarnings,
            rawCriticalWarnings: metrics.rawMaterials.criticalWarnings,
            rawItems: metrics.rawMaterials.totalItems,
            rawInventoryValue: Math.round(metrics.rawMaterials.inventoryValue).toLocaleString(),
            rawLowStockItems: [...metrics.rawMaterials.lowStockItems, ...metrics.rawMaterials.criticalStockItems],

            // Furniture metrics
            furnitureRevenue: Math.round(metrics.furniture.revenue).toLocaleString(),
            furnitureProfit: Math.round(metrics.furniture.profit).toLocaleString(),
            furnitureInventory: metrics.furniture.inventoryCount,
            furnitureStockWarnings: furnitureAllWarnings,
            furnitureCriticalWarnings: metrics.furniture.criticalWarnings,
            furnitureItems: metrics.furniture.totalItems,
            furnitureInventoryValue: Math.round(metrics.furniture.inventoryValue).toLocaleString(),
            furnitureLowStockItems: [...metrics.furniture.lowStockItems, ...metrics.furniture.criticalStockItems],

            // Percentages
            rawPercentage: metrics.total.inventoryCount > 0 ?
                Math.round((metrics.rawMaterials.inventoryCount / metrics.total.inventoryCount) * 100) : 0,
            furniturePercentage: metrics.total.inventoryCount > 0 ?
                Math.round((metrics.furniture.inventoryCount / metrics.total.inventoryCount) * 100) : 0
        };

        console.log("Dashboard accessed by:", currentUser.email);
        console.log("Dashboard stock warnings:", {
            totalWarnings: totalAllWarnings,
            criticalItems: metrics.total.criticalStockItems.length,
            lowItems: metrics.total.lowStockItems.length
        });

        res.render('dashboard', {
            currentUser: currentUser,
            dashboardData: dashboardData
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        const currentUser = req.user;
        res.render('dashboard', {
            currentUser: currentUser,
            dashboardData: getDefaultDashboardData()
        });
    }
});

// Helper function
function getDefaultDashboardData() {
    return {
        totalRevenue: '0',
        totalProfit: '0',
        totalInventory: '0',
        totalStockWarnings: '0',
        totalCriticalWarnings: '0',
        totalItems: '0',
        totalInventoryValue: '0',
        totalLowStockItems: [],
        rawRevenue: '0',
        rawProfit: '0',
        rawInventory: '0',
        rawStockWarnings: '0',
        rawCriticalWarnings: '0',
        rawItems: '0',
        rawInventoryValue: '0',
        rawLowStockItems: [],
        furnitureRevenue: '0',
        furnitureProfit: '0',
        furnitureInventory: '0',
        furnitureStockWarnings: '0',
        furnitureCriticalWarnings: '0',
        furnitureItems: '0',
        furnitureInventoryValue: '0',
        furnitureLowStockItems: [],
        rawPercentage: 0,
        furniturePercentage: 0
    };
}

router.post('/dashboard', ensureAuthenticated, ensureManager, (req, res) => {
    console.log(req.body);
});

module.exports = router;