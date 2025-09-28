// middleware/auth.js
const ensureAuthenticated = (req, res, next) => {
    console.log(" Authentication Check:");
    console.log("   req.isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : "Not available");
    console.log("   req.session.user:", req.session.user);
    console.log("   req.user:", req.user);

    // Check both Passport authentication and session authentication
    if (req.isAuthenticated() || req.session.user) {
        // If using session user, make it available as req.user for consistency
        if (!req.user && req.session.user) {
            req.user = req.session.user;
        }
        console.log(" User is authenticated");
        return next();
    }

    console.log(" User is NOT authenticated - redirecting to login");
    res.redirect('/login');
};

const ensureAgent = (req, res, next) => {
    console.log("👤 Agent Check:");

    // Get user from either source
    const user = req.user || req.session.user;
    console.log("   User role:", user ? user.role : "No user");

    if (user && (user.role === 'Sales Agent' || user.role === 'Manager' || user.role === 'manager')) {
        console.log(" User has agent/manager access");
        return next();
    }

    console.log(" User does not have agent privileges");
    res.redirect('/login');
};

const ensureManager = (req, res, next) => {
    console.log(" Manager Check:");

    const user = req.user || req.session.user;
    console.log("   User role:", user ? user.role : "No user");
    console.log("   User isManager:", user ? user.isManager : "No user");

    if (user && (user.role === 'Manager' || user.role === 'manager' || user.isManager)) {
        console.log(" User is manager");
        return next();
    }

    console.log(" User is NOT manager");
    res.redirect('/login');
};

module.exports = {
    ensureAuthenticated,
    ensureAgent,
    ensureManager
};