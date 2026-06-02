const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // ADD THIS
const { managerProfile } = require("../configs/managerConfigs");
const UserModel = require("../models/userModel");

// GET login page
router.get("/login", (req, res) => {
    res.render("login", { title: "Login page" });
});

// POST login - uses Passport's req.login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', {
            title: "Login page",
            error: "Email and password are required"
        });
    }

    const managerEmail = process.env.MANAGER_EMAIL;
    const managerPassword = process.env.MANAGER_PASSWORD;

    try {
        let user = null;

        // 1. Check manager credentials
        if (email === managerEmail && password === managerPassword) {
            user = {
                _id: new mongoose.Types.ObjectId(),
                email: email,
                username: managerProfile.username,
                name: managerProfile.fname,
                role: 'manager',
                isManager: true
            };
            console.log("Manager authenticated");
        }
        // 2. Check sales agent in database
        else {
            const salesAgent = await UserModel.findOne({ email: email, role: 'sales_agent' });
            if (salesAgent) {
                // FIX: Use bcrypt to compare password
                const isPasswordValid = await bcrypt.compare(password, salesAgent.password);

                if (isPasswordValid) {
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
        }

        if (!user) {
            console.log("Login failed - invalid credentials");
            return res.status(401).render('login', {
                title: "Login page",
                error: "Invalid credentials"
            });
        }

        // Use Passport's req.login to establish session
        req.login(user, (err) => {
            if (err) {
                console.error("req.login error:", err);
                return res.status(500).render('login', {
                    title: "Login page",
                    error: "Authentication error"
                });
            }
            console.log("Login successful - redirecting");
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

// Debug routes
router.get("/test-env", (req, res) => {
    res.json({
        managerEmail: process.env.MANAGER_EMAIL || "NOT SET",
        hasManagerPassword: !!process.env.MANAGER_PASSWORD,
    });
});

router.get("/debug-auth", (req, res) => {
    res.json({
        user: req.user ? { email: req.user.email, role: req.user.role } : null,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false
    });
});

// Logout handlers
router.post("/logout", (req, res) => {
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