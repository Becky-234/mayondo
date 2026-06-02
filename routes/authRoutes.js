const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");  // <-- ADDED
const { managerProfile } = require("../configs/managerConfigs");
const UserModel = require("../models/userModel");

// Getting the Login form
router.get("/login", (req, res) => {
    res.render("login", { title: "Login page" });
});

// Use Passport's authenticate middleware, but with custom verification
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', {
            title: "Login page",
            error: "Email and password are required"
        });
    }

    const managerEmail = process.env.MANAGER_EMAIL;
    const managerPassword = process.env.MANAGER_PASSWORD;

    console.log("Login Debug:", { email });

    try {
        let user = null;

        // 1. Check manager
        if (email === managerEmail && password === managerPassword) {
            // Create a user-like object for manager (must have an _id)
            user = {
                _id: new mongoose.Types.ObjectId(),
                email: email,
                username: managerProfile.username,
                name: managerProfile.fname,
                ...managerProfile,
                role: 'manager',
                isManager: true
            };
            console.log("Manager authenticated");
        }
        // 2. Check sales agent from database
        else {
            const salesAgent = await UserModel.findOne({
                email: email,
                role: 'sales_agent'
            });
            if (salesAgent && password === salesAgent.password) {
                user = {
                    _id: salesAgent._id,
                    name: salesAgent.name,
                    email: salesAgent.email,
                    tel: salesAgent.tel,
                    username: salesAgent.username,
                    role: 'sales_agent',
                    isManager: false
                };
                console.log("Sales agent authenticated");
            }
        }

        if (!user) {
            console.log("Login failed - invalid credentials");
            return res.status(401).render('login', {
                title: "Login page",
                error: "Invalid credentials"
            });
        }

        // Use Passport's req.login to properly establish session
        req.login(user, (err) => {
            if (err) {
                console.error("req.login error:", err);
                return res.status(500).render('login', {
                    title: "Login page",
                    error: "Authentication error"
                });
            }
            console.log("Login successful - redirecting");
            // Redirect based on role
            if (user.role === 'manager') {
                return res.redirect('/dashboard');
            } else {
                return res.redirect('/sales');
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).render('login', {
            title: "Login page",
            error: "System error during login"
        });
    }
});

// Test route
router.get("/test-env", (req, res) => {
    res.json({
        managerEmail: process.env.MANAGER_EMAIL || "NOT SET",
        hasManagerPassword: !!process.env.MANAGER_PASSWORD,
        managerPasswordLength: process.env.MANAGER_PASSWORD ? process.env.MANAGER_PASSWORD.length : 0
    });
});

router.get("/debug-auth", (req, res) => {
    res.json({
        reqUser: req.user,
        reqSessionUser: req.session?.user,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'N/A'
    });
});

// Logout (both POST and GET)
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        req.session.destroy((err) => {
            if (err) console.error("Session destroy error:", err);
            res.clearCookie('mwf.sid'); // match the cookie name in server.js
            res.redirect("/login");
        });
    });
});

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        req.session.destroy((err) => {
            if (err) console.error("Session destroy error:", err);
            res.clearCookie('mwf.sid');
            res.redirect("/login");
        });
    });
});

module.exports = router;