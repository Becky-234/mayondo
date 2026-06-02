//1.DEPENDENCIES
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const moment = require("moment");
const methodOverride = require('method-override');
const LocalStrategy = require('passport-local').Strategy;

const UserModel = require("./models/userModel");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const salesRoutes = require("./routes/salesRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const indexRoutes = require("./routes/indexRoutes");
const userRoutes = require("./routes/userRoutes");

//2.INSTANTIATIONS
const app = express();
const PORT = process.env.PORT || 3001;

// TRUST PROXY - Required for sessions on Render
app.set('trust proxy', 1);

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

// View engine
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

// SESSION CONFIGURATION (Fixed for Render)
app.use(
  expressSession({
    name: 'mwf.sid',
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,          // MUST be false for Render (proxy doesn't forward HTTPS correctly)
      httpOnly: true,
      sameSite: 'lax'
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// LOCAL STRATEGY (authenticate with email + password)
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    // Plain text comparison – upgrade to bcrypt in production
    if (user.password !== password) {
      return done(null, false, { message: 'Invalid email or password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Serialization / Deserialization
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

// Make currentUser available to all templates
app.use((req, res, next) => {
  if (req.user) {
    res.locals.currentUser = req.user;
  } else if (req.session && req.session.user) {
    res.locals.currentUser = req.session.user;
  } else {
    res.locals.currentUser = null;
  }
  console.log('Current User Available:', !!res.locals.currentUser);
  next();
});

// ========= DEFAULT ROOT ROUTE (Fixes "Cannot GET /") =========
app.get('/', (req, res) => {
  // If user is logged in, go to dashboard; otherwise go to login
  if (req.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});
// ============================================================

//5.ROUTES
app.use("/", authRoutes);
app.use("/", stockRoutes);
app.use("/", salesRoutes);
app.use("/", productRoutes);
app.use("/", dashboardRoutes);
app.use("/", indexRoutes);
app.use("/", userRoutes);

// Catch-all 404 handler (optional)
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));