const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel");
const passport = require("passport");

//Getting the signup form
router.get("/signup", (req, res) => {
    res.render("signup", { title: "signup page" });
});

router.post("/signup", async (req, res) => {
    try {
        const user = new UserModel(req.body);
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render("signup", { 
                title: "signup page", 
                error: "Email already exists. Please use a different email." 
            });
        }
        
        UserModel.register(user, req.body.password, (err) => {
            if (err) {
                console.error("Registration error:", err);
                return res.render("signup", { 
                    title: "signup page", 
                    error: "Registration failed: " + err.message 
                });
            }
            console.log("User registered successfully:", user.email);
            res.redirect("/login");
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.render("signup", { 
            title: "signup page", 
            error: "Registration failed. Please try again." 
        });
    }
});
 

//Getting the Login form
router.get("/login", (req, res) => {
    res.render("login", { title: "Login page" });
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            console.error("Login error:", err);
            return res.status(500).render("login", { 
                title: "Login page", 
                error: "An error occurred during login" 
            });
        }
        
        if (!user) {
            console.log("Login failed:", info);
            return res.status(401).render("login", { 
                title: "Login page", 
                error: "Invalid email or password" 
            });
        }
        
        req.logIn(user, (err) => {
            if (err) {
                console.error("Session login error:", err);
                return res.status(500).render("login", { 
                    title: "Login page", 
                    error: "Session error" 
                });
            }
            
            console.log("Logged-in user:", user);
            req.session.user = user;
            
            if (user.role === "Manager") {
                return res.redirect("/dashboard");
            } else if (user.role === "Sales agent") {
                return res.redirect("/sales");
            } else {
                return res.render("noneuser", { title: "Access Denied" });
            }
        });
    })(req, res, next);
});



//LOGGING OUT
router.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                return res.status(500).send("Error logging out");
            }
            res.redirect("/");
        });
    }
});

module.exports = router;
