const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { managerProfile } = require("../configs/managerConfigs");
const UserModel = require("../models/userModel");

// GET login page
router.get("/login", (req, res) => {
    res.render("login", {
        title: "Login page",
        error: req.query.error || null,
        email: req.query.email || ""
    });
});

// POST login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);

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

        // 1. Check manager credentials (virtual manager)
        if (managerEmail && email === managerEmail && password === managerPassword) {
            user = {
                _id: new mongoose.Types.ObjectId(),
                email: email,
                username: managerProfile.username,
                name: managerProfile.fname,
                role: 'manager',
                isManager: true
            };
            console.log("✅ Manager authenticated (virtual)");
        }
        // 2. Check database user
        else {
            const dbUser = await UserModel.findOne({ email: email });

            if (!dbUser) {
                console.log("❌ User not found:", email);
                return res.render('login', {
                    title: "Login page",
                    error: "Invalid email or password",
                    email: email
                });
            }

            console.log("User found:", dbUser.email, "Role:", dbUser.role);

            // Verify password
            let isPasswordValid = false;
            try {
                isPasswordValid = await bcrypt.compare(password, dbUser.password);
                console.log("Password validation:", isPasswordValid ? "✅ Valid" : "❌ Invalid");
            } catch (bcryptError) {
                console.error("Bcrypt error:", bcryptError);
                if (dbUser.password === password) {
                    isPasswordValid = true;
                    console.log("⚠️ Used plain text password match");
                }
            }

            if (isPasswordValid) {
                user = {
                    _id: dbUser._id,
                    name: dbUser.name,
                    email: dbUser.email,
                    tel: dbUser.tel,
                    username: dbUser.username,
                    role: dbUser.role,
                    isManager: dbUser.role === 'manager'
                };
                console.log("✅ Database user authenticated:", dbUser.email);
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

        // Login with Passport
        req.login(user, (err) => {
            if (err) {
                console.error("❌ req.login error:", err);
                return res.render('login', {
                    title: "Login page",
                    error: "Authentication error",
                    email: email
                });
            }

            console.log("✅ Login successful");

            // Force session save
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error("❌ Session save error:", saveErr);
                    return res.render('login', {
                        title: "Login page",
                        error: "Session error",
                        email: email
                    });
                }

                console.log("✅ Session saved with user:", req.session.passport?.user);

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

// ==============================================
// CREATE USER ROUTES (NO REGISTRATION FORM NEEDED)
// ==============================================

// Create manager user in database
router.get('/create-manager-user', async (req, res) => {
    try {
        const email = 'bkirabo853@gmail.com';
        const password = 'admin123'; // CHANGE THIS TO YOUR PASSWORD

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.json({
                success: false,
                message: 'User already exists!',
                user: {
                    email: existingUser.email,
                    role: existingUser.role
                }
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = new UserModel({
            name: 'Kirabo Rebecca',
            email: email,
            username: 'Becky',
            password: hashedPassword,
            tel: '+256744807739',
            role: 'manager',
            createdAt: new Date()
        });

        await newUser.save();

        res.json({
            success: true,
            message: '✅ Manager user created successfully!',
            user: {
                email: email,
                password: password,
                role: 'manager'
            },
            instruction: 'Now login with these credentials'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create sales agent user
router.get('/create-sales-user', async (req, res) => {
    try {
        const email = 'sales@mayondo.com';
        const password = 'sales123';

        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.json({
                success: false,
                message: 'Sales user already exists!',
                user: {
                    email: existingUser.email,
                    role: existingUser.role
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            name: 'Sales Agent',
            email: email,
            username: 'salesagent',
            password: hashedPassword,
            tel: '+256700000000',
            role: 'sales_agent',
            createdAt: new Date()
        });

        await newUser.save();

        res.json({
            success: true,
            message: '✅ Sales agent created successfully!',
            user: {
                email: email,
                password: password,
                role: 'sales_agent'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create user with custom details (via query parameters)
// Example: /create-user?email=user@test.com&password=123456&role=manager
router.get('/create-user', async (req, res) => {
    try {
        const { email, password, name, role } = req.query;

        if (!email || !password) {
            return res.json({ error: 'Email and password are required. Use: /create-user?email=test@test.com&password=123456' });
        }

        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            name: name || email.split('@')[0],
            email: email,
            username: email.split('@')[0],
            password: hashedPassword,
            tel: '',
            role: role || 'sales_agent',
            createdAt: new Date()
        });

        await newUser.save();

        res.json({
            success: true,
            message: '✅ User created successfully!',
            user: {
                email: email,
                password: password,
                role: role || 'sales_agent'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================================
// DEBUG ROUTES
// ==============================================

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

router.get("/check-users", async (req, res) => {
    try {
        const users = await UserModel.find({}).select('email role username name');
        res.json({
            count: users.length,
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete all users (BE CAREFUL - for testing only)
router.get('/delete-all-users', async (req, res) => {
    try {
        await UserModel.deleteMany({});
        res.json({ success: true, message: 'All users deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==============================================
// LOGOUT ROUTES
// ==============================================

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