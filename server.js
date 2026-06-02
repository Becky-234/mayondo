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
  tlsAllowInvalidCertificates: true,
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
      secure: false,          // Required for Render
      httpOnly: true,
      sameSite: 'lax'
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Serialization: store only the user's id (or a special marker for manager)
passport.serializeUser((user, done) => {
  // For manager, we store a special string: 'manager_' + their email
  if (user.isManager) {
    return done(null, `manager_${user.email}`);
  }
  // For normal DB users, store the ObjectId as string
  done(null, user._id.toString());
});

// Deserialization: retrieve full user object from DB or create manager object
passport.deserializeUser(async (id, done) => {
  // Check if it's a manager marker
  if (typeof id === 'string' && id.startsWith('manager_')) {
    const email = id.replace('manager_', '');
    // Reconstruct manager object (you can fetch from config or env)
    const managerProfile = require("./configs/managerConfigs").managerProfile;
    const managerUser = {
      _id: 'manager_' + email,  // fake ID
      email: email,
      username: managerProfile.username,
      name: managerProfile.fname,
      ...managerProfile,
      role: 'manager',
      isManager: true
    };
    return done(null, managerUser);
  }

  // Otherwise, fetch from MongoDB
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Make currentUser available to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  console.log('Current User Available:', !!res.locals.currentUser);
  next();
});

// ========= DEFAULT ROOT ROUTE =========
app.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

//5.ROUTES
app.use("/", authRoutes);
app.use("/", stockRoutes);
app.use("/", salesRoutes);
app.use("/", productRoutes);
app.use("/", dashboardRoutes);
app.use("/", indexRoutes);
app.use("/", userRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));