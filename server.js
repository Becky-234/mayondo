//1.DEPENDENCIES
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require('express-session');
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const moment = require("moment");
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local').Strategy;



const UserModel = require("./models/userModel");

//Import Routes
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const salesRoutes = require("./routes/salesRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const indexRoutes = require("./routes/indexRoutes");
const userRoutes = require("./routes/userRoutes");
//const settingsRoutes = require("./routes/settingsRoutes");


//2.INSTANTIATIONS
const app = express();
const PORT = process.env.PORT || 3001;


//3.CONFIGURATIONS
app.locals.moment = moment;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
  tls: true,
  tlsAllowInvalidCertificates: true,   // Bypass SSL validation for Render
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch(err => console.log(`Connection error: ${err.message}`));

// Setting view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


//4.MIDDLEWARE
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.use("/html", express.static(path.join(__dirname, "html")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// For active pages
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Session configuration
app.use(
  expressSession({
    name: 'mwf.sid', // Give session a specific name
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Manual Passport configuration
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// passport.use(new LocalStrategy({
//   usernameField: 'email'
// }, async (email, password, done) => {
//   try {
//     const user = await UserModel.findOne({ email: email, status: 'active' });

//     if (!user) {
//       return done(null, false, { message: 'User not found' });
//     }

//     // For production, use bcrypt.compare()
//     if (user.password !== password) {
//       return done(null, false, { message: 'Incorrect password' });
//     }

//     return done(null, user);
//   } catch (error) {
//     return done(error);
//   }
// }));



// Make currentUser available to all templates - FIXED VERSION


app.use((req, res, next) => {
  // Checking for both Passport's req.user AND custom req.session.user
  if (req.user) {
    // Passport.js user
    res.locals.currentUser = req.user;
  } else if (req.session && req.session.user) {
    // custom session user
    res.locals.currentUser = req.session.user;
  } else {
    res.locals.currentUser = null;
  }

  console.log('Current User Available:', !!res.locals.currentUser);
  console.log('User from session:', req.session?.user?.email);
  console.log('User from Passport:', req.user?.email);
  next();
});

 

//5.ROUTES
app.use("/", authRoutes);
app.use("/", stockRoutes);
app.use("/", salesRoutes);
app.use("/", productRoutes);
app.use("/", dashboardRoutes);
app.use("/", indexRoutes);
app.use("/", userRoutes);
// app.use("/", settingsRoutes);


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));