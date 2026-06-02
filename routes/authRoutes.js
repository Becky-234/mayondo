const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { managerProfile } = require("../configs/managerConfigs");
const UserModel = require("../models/userModel");

// GET login page
router.get("/login", (req, res) => {
    // Pass any error from query string to the template
    res.render("login", {
        title: "Login page",
        error: req.query.error || null,
        email: req.query.email || ""
    });
});

// POST login - uses Passport's req.login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Password provided:", !!password);

    if (!email || !password) {
        return res.render('login', {
            title: "Login page",
            error: "Email and password are required",
            email: email
        });
    }

    const managerEmail = process.env.MANAGER_EMAIL;
    const managerPassword = process.env.MANAGER_PASSWORD;

    try {
        let user = null;

        // 1. Check manager credentials
        if (managerEmail && email === managerEmail && password === managerPassword) {
            user = {
                _id: new mongoose.Types.ObjectId(),
                email: email,
                username: managerProfile.username,
                name: managerProfile.fname,
                role: 'manager',
                isManager: true
            };
            console.log("✅ Manager authenticated");
        }
        // 2. Check sales agent in database
        else {
            const salesAgent = await UserModel.findOne({ email: email });

            if (!salesAgent) {
                console.log("❌ User not found:", email);
                return res.render('login', {
                    title: "Login page",
                    error: "Invalid email or password",
                    email: email
                });
            }

            console.log("User found:", salesAgent.email, "Role:", salesAgent.role);

            // Use bcrypt to compare password
            let isPasswordValid = false;
            try {
                isPasswordValid = await bcrypt.compare(password, salesAgent.password);
                console.log("Password validation:", isPasswordValid ? "✅ Valid" : "❌ Invalid");
            } catch (bcryptError) {
                console.error("Bcrypt error:", bcryptError);
                // Fallback for plain text passwords (temporary)
                if (salesAgent.password === password) {
                    isPasswordValid = true;
                    console.log("⚠️ Used plain text password match - consider rehashing");
                }
            }

            if (isPasswordValid) {
                user = {
                    _id: salesAgent._id,
                    name: salesAgent.name,
                    email: salesAgent.email,
                    tel: salesAgent.tel,
                    username: salesAgent.username,
                    role: salesAgent.role || 'sales_agent',
                    isManager: false
                };
                console.log("✅ Sales agent authenticated:", salesAgent.email);
            } else {
                console.log("❌ Invalid password for:", email);
                return res.render('login', {
                    title: "Login page",
                    error: "Invalid email or password",
                    email: email
                });
            }
        }

        if (!user) {
            console.log("❌ Login failed - user object not created");
            return res.render('login', {
                title: "Login page",
                error: "Invalid credentials",
                email: email
            });
        }

        // Use Passport's req.login to establish session
        req.login(user, (err) => {
            if (err) {
                console.error("❌ req.login error:", err);
                return res.render('login', {
                    title: "Login page",
                    error: "Authentication system error",
                    email: email
                });
            }

            console.log("✅ Login successful - user saved to session");
            console.log("Session ID:", req.sessionID);
            console.log("User role:", user.role);

            // EXPLICITLY SAVE THE SESSION - CRITICAL FOR RENDER
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("❌ Session save error:", saveErr);
                    return res.render('login', {
                        title: "Login page",
                        error: "Session error - please try again",
                        email: email
                    });
                }

                console.log("✅ Session saved successfully");
                console.log("Redirecting to:", user.role === 'manager' ? '/dashboard' : '/sales');

                // Redirect based on role
                if (user.role === 'manager') {
                    return res.redirect('/dashboard');
                } else {
                    return res.redirect('/sales');
                }
            });
        });
    } catch (error) {
        console.error("❌ Login error details:", error);
        return res.render('login', {
            title: "Login page",
            error: "System error during login. Please try again.",
            email: email
        });
    }
});

// Debug routes
router.get("/test-env", (req, res) => {
    res.json({
        managerEmail: process.env.MANAGER_EMAIL || "NOT SET",
        hasManagerPassword: !!process.env.MANAGER_PASSWORD,
        nodeEnv: process.env.NODE_ENV || "NOT SET",
        sessionSecret: process.env.SESSION_SECRET ? "SET" : "NOT SET"
    });
});

router.get("/debug-auth", (req, res) => {
    res.json({
        user: req.user ? {
            email: req.user.email,
            role: req.user.role,
            isManager: req.user.isManager || false
        } : null,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        sessionID: req.sessionID,
        sessionExists: !!req.session
    });
});

// Check users in database (temporary debug route)
router.get("/check-users", async (req, res) => {
    try {
        const users = await UserModel.find({}).select('email role username');
        res.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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