express = require("express");
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
            return res.status(400).send("Email exists");
        }
        await UserModel.register(user, req.body.password, (err) => {
            if (err) {
                throw err;
            }
            res.redirect("/login");
        });
    } catch (error) {
        console.error(error);
        res.status(400).send("Try again");
    }
});


//Getting the Login form
router.get("/login", (req, res) => {
    res.render("login", { title: "Login page" });
});

router.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
        console.log("Logged-in user:", req.user);
        // req.session.user = req.user;
        // if (req.user.role === "Manager") {
        //     return res.redirect("/dashboard");
        // } else if (req.user.role === "Sales agent") {
        //     return res.redirect("/sales");
        // } else {
        //     return res.render("noneuser");
        // }
    }
);



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
