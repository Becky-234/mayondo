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

// Import manager profile (do it once at top)
let managerProfile = {};
try {
  const managerConfig = require("./configs/managerConfigs");
  managerProfile = managerConfig.managerProfile || managerConfig;
  console.log("Manager profile loaded:", managerProfile?.username);
} catch (err) {
  console.error("Failed to load managerConfigs:", err.message);
  // Provide fallback to avoid crash
  managerProfile = { username: "manager", fname: "Manager" };
}

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
const PORT = process.env.PORT || 10000;

// TRUST PROXY - Required for sessions on Render
app.set('trust proxy', 1);

//3.CONFIGURATIONS
app.locals.moment = moment;

// MongoDB connection
if (!process.env.MONGODB_URL) {
  console.error("FATAL: MONGODB_URL environment variable not set");
  process.exit(1);
}
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

// SESSION CONFIGURATION
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("FATAL: SESSION_SECRET environment variable not set");
  process.exit(1);
}
app.use(
  expressSession({
    name: 'mwf.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
      sameSite: 'lax'
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Serialization: store user identifier
passport.serializeUser((user, done) => {
  if (user.isManager) {
    return done(null, `manager_${user.email}`);
  }
  done(null, user._id.toString());
});

// Deserialization: reconstruct user object
passport.deserializeUser(async (id, done) => {
  try {
    // Handle manager
    if (typeof id === 'string' && id.startsWith('manager_')) {
      const email = id.replace('manager_', '');
      const managerUser = {
        _id: 'manager_' + email,
        email: email,
        username: managerProfile.username,
        name: managerProfile.fname,
        role: 'manager',
        isManager: true,
        ...managerProfile
      };
      return done(null, managerUser);
    }
    // Regular database user
    const user = await UserModel.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    console.error("Deserialize error:", error);
    done(error);
  }
});

// Make currentUser available to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  console.log('Current User Available:', !!res.locals.currentUser);
  next();
});

// DEFAULT ROOT ROUTE
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

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));