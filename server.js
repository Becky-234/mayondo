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

// ==============================================
// SESSION CONFIGURATION - FINAL FIX FOR RENDER
// ==============================================
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("FATAL: SESSION_SECRET environment variable not set");
  process.exit(1);
}

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGODB_URL,
  collectionName: 'sessions',
  ttl: 24 * 60 * 60 // 24 hours
});

app.use(expressSession({
  name: 'mwf.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  },
  proxy: true
}));

// Session debug middleware
app.use((req, res, next) => {
  console.log("🔍 SESSION CHECK - ID:", req.sessionID);
  console.log("🔍 SESSION CHECK - User:", req.user?.email || 'No user');
  if (req.session) {
    console.log("🔍 SESSION CHECK - Passport user:", req.session.passport?.user || 'None');
  }
  next();
});

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Serialization
passport.serializeUser((user, done) => {
  console.log("📝 Serializing user:", user.email || user._id);
  if (user.isManager) {
    return done(null, `manager_${user.email}`);
  }
  done(null, user._id.toString());
});

// Deserialization
passport.deserializeUser(async (id, done) => {
  try {
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
  next();
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// DEFAULT ROOT ROUTE
app.get('/', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// ==============================================
// TEMPORARY USER CREATION ROUTES
// ==============================================

// Create super user - VISIT THIS URL FIRST
app.get('/create-super-user', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: 'bkirabo853@gmail.com' });
    if (existingUser) {
      return res.send(`
                <html>
                <body style="font-family: Arial; padding: 40px; text-align: center;">
                    <h1 style="color: orange;">✅ User Already Exists!</h1>
                    <p><strong>Email:</strong> bkirabo853@gmail.com</p>
                    <p><strong>Role:</strong> ${existingUser.role}</p>
                    <br>
                    <a href="/login" style="background: green; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Login →</a>
                </body>
                </html>
            `);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const newUser = new UserModel({
      name: 'Kirabo Rebecca',
      email: 'bkirabo853@gmail.com',
      username: 'Becky',
      password: hashedPassword,
      tel: '+256744807739',
      role: 'manager',
      createdAt: new Date()
    });

    await newUser.save();

    res.send(`
            <html>
            <body style="font-family: Arial; padding: 40px; text-align: center;">
                <h1 style="color: green;">✅ SUPER USER CREATED SUCCESSFULLY!</h1>
                <p><strong>Email:</strong> bkirabo853@gmail.com</p>
                <p><strong>Password:</strong> admin123</p>
                <p><strong>Role:</strong> Manager</p>
                <br>
                <a href="/login" style="background: green; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Click here to Login →</a>
            </body>
            </html>
        `);
  } catch (error) {
    res.send(`<h1>Error:</h1><p>${error.message}</p>`);
  }
});

// Check all users in database
app.get('/view-users', async (req, res) => {
  try {
    const users = await UserModel.find({}).select('email role name username');
    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Create a sales agent quickly
app.get('/create-sales-agent', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');

    const existingUser = await UserModel.findOne({ email: 'agent@mayondo.com' });
    if (existingUser) {
      return res.send(`<h3>Sales agent already exists!</h3><a href="/login">Login</a>`);
    }

    const hashedPassword = await bcrypt.hash('agent123', 10);

    const newUser = new UserModel({
      name: 'Sales Agent',
      email: 'agent@mayondo.com',
      username: 'salesagent',
      password: hashedPassword,
      tel: '+256700000000',
      role: 'sales_agent',
      createdAt: new Date()
    });

    await newUser.save();

    res.send(`
            <h1 style="color: green;">✅ Sales Agent Created!</h1>
            <p>Email: agent@mayondo.com</p>
            <p>Password: agent123</p>
            <a href="/login">Go to Login</a>
        `);
  } catch (error) {
    res.send(`Error: ${error.message}`);
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

// Debug session endpoint
app.get('/debug-session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    sessionExists: !!req.session,
    passportUser: req.session?.passport?.user || null,
    user: req.user ? { email: req.user.email, role: req.user.role } : null,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send('Internal Server Error');
});

// ==============================================
// START SERVER
// ==============================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`❤️ Health check: /health`);
  console.log(`🔍 Session debug: /debug-session`);
  console.log(`👤 Create super user: /create-super-user`);
});

server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error closing MongoDB:', err);
        process.exit(1);
      });
  });
});