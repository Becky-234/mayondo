const express = require('express');
const router = express.Router();
const StockModel = require("../models/stockModel");
const SalesModel = require("../models/salesModel");

// Dashboard Page with Product Type Separation
router.get('/dashboard', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    
    try {
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
                inventoryValue: 0
            },
            rawMaterials: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                items: []
            },
            furniture: {
                revenue: 0,
                profit: 0,
                inventoryCount: 0,
                stockWarnings: 0,
                totalItems: 0,
                inventoryValue: 0,
                items: []
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
            
            // Update total metrics
            metrics.total.revenue += itemRevenue;
            metrics.total.profit += itemProfit;
            metrics.total.inventoryCount++;
            metrics.total.totalItems += item.pdtquantity;
            metrics.total.inventoryValue += itemCost;
            
            if (item.pdtquantity < 10) {
                metrics.total.stockWarnings++;
            }
            
            // Update specific product type metrics
            if (metrics[productType]) {
                metrics[productType].revenue += itemRevenue;
                metrics[productType].profit += itemProfit;
                metrics[productType].inventoryCount++;
                metrics[productType].totalItems += item.pdtquantity;
                metrics[productType].inventoryValue += itemCost;
                metrics[productType].items.push(item);
                
                if (item.pdtquantity < 10) {
                    metrics[productType].stockWarnings++;
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
            
            // Raw Materials metrics
            rawRevenue: Math.round(metrics.rawMaterials.revenue).toLocaleString(),
            rawProfit: Math.round(metrics.rawMaterials.profit).toLocaleString(),
            rawInventory: metrics.rawMaterials.inventoryCount,
            rawStockWarnings: metrics.rawMaterials.stockWarnings,
            rawItems: metrics.rawMaterials.totalItems,
            rawInventoryValue: Math.round(metrics.rawMaterials.inventoryValue).toLocaleString(),
            
            // Furniture metrics
            furnitureRevenue: Math.round(metrics.furniture.revenue).toLocaleString(),
            furnitureProfit: Math.round(metrics.furniture.profit).toLocaleString(),
            furnitureInventory: metrics.furniture.inventoryCount,
            furnitureStockWarnings: metrics.furniture.stockWarnings,
            furnitureItems: metrics.furniture.totalItems,
            furnitureInventoryValue: Math.round(metrics.furniture.inventoryValue).toLocaleString(),
            
            // Percentages
            rawPercentage: metrics.total.inventoryCount > 0 ? 
                Math.round((metrics.rawMaterials.inventoryCount / metrics.total.inventoryCount) * 100) : 0,
            furniturePercentage: metrics.total.inventoryCount > 0 ? 
                Math.round((metrics.furniture.inventoryCount / metrics.total.inventoryCount) * 100) : 0
        };
        
        res.render('dashboard', { 
            currentUser: req.user,
            dashboardData: dashboardData
        });
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('dashboard', { 
            currentUser: req.user,
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
        rawRevenue: '0',
        rawProfit: '0',
        rawInventory: '0',
        rawStockWarnings: '0',
        rawItems: '0',
        rawInventoryValue: '0',
        furnitureRevenue: '0',
        furnitureProfit: '0',
        furnitureInventory: '0',
        furnitureStockWarnings: '0',
        furnitureItems: '0',
        furnitureInventoryValue: '0',
        rawPercentage: 0,
        furniturePercentage: 0
    };
}

module.exports = router;