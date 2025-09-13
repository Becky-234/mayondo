//1.DEPENDENCIES
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const moment = require("moment");

require("dotenv").config();
const UserModel = require("./models/userModel");

//Import Routes
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const salesRoutes = require("./routes/salesRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const indexRoutes = require("./routes/indexRoutes");

//2.INSTANTIATIONS
const app = express();
const port = 3001;

//3.CONFIGURATIONS
app.locals.moment = moment;
//Setting mongodb connections
mongoose.connect(process.env.MONGODB_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
});

mongoose.connection
  .on("open", () => {
    console.log("Sucessfully connected to Mongodb");
  })
  .on("error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });

//Setting view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//4.MIDDLEWARE
app.use(express.static("public"));
app.use("/html", express.static(path.join(__dirname, "html"))); // Serve everything in "html"
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); //helps to pass data from forms
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, //One day
  })
);

//Passport Configs
app.use(passport.initialize());
app.use(passport.session());

//Authenticate with Passport local strategy
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

//5.ROUTES
//Using Imported Routes
app.use("/", authRoutes);
app.use("/", stockRoutes);
app.use("/", salesRoutes);
app.use("/", productRoutes);
app.use("/", dashboardRoutes);
app.use("/", indexRoutes);

app.listen(port, () => console.log(`Listening on port ${port}`));
