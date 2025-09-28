const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { managerProfile } = require("../configs/managerConfigs");
const UserModel = require("../models/userModel"); // Import UserModel

// Getting the Login form
router.get("/login", (req, res) => {
    res.render("login", { title: "Login page" });
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const managerEmail = process.env.MANAGER_EMAIL;
        const managerPassword = process.env.MANAGER_PASSWORD;

        console.log("Login Debug:");
        console.log("Input Email:", email);

        // 1. Check if it's the manager login
        if (email === managerEmail && password === managerPassword) {
            // Create manager user data
            const userData = {
                email: email,
                ...managerProfile,
                role: 'manager',
                isManager: true,
                loginTime: new Date(),
                lastActivity: new Date()
            };

            // Set session user
            req.session.user = userData;

            // Save the session
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).render('login', {
                        title: "Login page",
                        error: "Authentication error"
                    });
                }

                console.log("Manager login successful - session saved");
                return res.redirect('/dashboard');
            });
        }
        // 2. Check if it's a sales agent login
        else {
            // Find sales agent by email
            const salesAgent = await UserModel.findOne({
                email: email,
                role: 'sales_agent'
            });

            if (salesAgent) {
                console.log("Found sales agent:", salesAgent.email);

                // Check if password matches (plain text comparison since you're storing plain text)
                if (password === salesAgent.password) {
                    // Create sales agent user data
                    const userData = {
                        _id: salesAgent._id,
                        name: salesAgent.name,
                        email: salesAgent.email,
                        tel: salesAgent.tel,
                        username: salesAgent.username,
                        role: 'sales_agent',
                        isManager: false,
                        loginTime: new Date(),
                        lastActivity: new Date()
                    };

                    // Set session user
                    req.session.user = userData;

                    // Save the session
                    req.session.save((err) => {
                        if (err) {
                            console.error("Session save error:", err);
                            return res.status(500).render('login', {
                                title: "Login page",
                                error: "Authentication error"
                            });
                        }

                        console.log("Sales Agent login successful - session saved");
                        return res.redirect('/sales');
                    });
                } else {
                    console.log("Sales Agent login failed - password incorrect");
                    return res.status(401).render('login', {
                        title: "Login page",
                        error: "Invalid credentials"
                    });
                }
            } else {
                console.log(" Login failed - user not found");
                return res.status(401).render('login', {
                    title: "Login page",
                    error: "Invalid credentials"
                });
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).render('login', {
            title: "Login page",
            error: "System error during login"
        });
    }
});

// Add this test route to check environment variables
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
        reqSessionUser: req.session.user,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'N/A'
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.status(500).send("Error logging out");
        }
        res.redirect("/login");
    });
});

module.exports = router;