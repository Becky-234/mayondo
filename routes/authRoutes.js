const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { managerProfile } = require("../configs/managerConfigs");

// Getting the Login form
router.get("/login", (req, res) => {
    res.render("login", { title: "Login page" });
});


 
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const managerEmail = process.env.MANAGER_EMAIL;
    const managerPassword = process.env.MANAGER_PASSWORD;

    console.log("Login Debug:");
    console.log("Input Email:", email);
    console.log("Env Manager Email:", managerEmail || "NOT FOUND");

    if (!managerEmail || !managerPassword) {
        console.error("Manager credentials not configured");
        return res.status(500).render('login', {
            title: "Login page",
            error: "System temporarily unavailable."
        });
    }

    if (email === managerEmail && password === managerPassword) {
        // Create user data
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

        // IMPORTANT: Save the session explicitly
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).render('login', {
                    title: "Login page",
                    error: "Authentication error"
                });
            }

            console.log("✅ Manager login successful - session saved");
            console.log("Session ID:", req.sessionID);
            return res.redirect('/dashboard');
        });
    } else {
        console.log("❌ Login failed - credentials don't match");
        res.status(401).render('login', {
            title: "Login page",
            error: "Invalid credentials"
        });
    }
});  

// // Use Passport.js login method
// req.login(managerUser, (err) => {
//     if (err) {
//         console.error("Login error:", err);
//         return res.status(500).render('login', {
//             title: "Login page",
//             error: "Authentication error"
//         });
//     }

//     console.log(" Manager login successful");
//     return res.redirect('/dashboard');
// } else {
//     res.status(401).render('login', {
//         title: "Login page",
//         error: "Invalid credentials"
//     });
// }
// });
    



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