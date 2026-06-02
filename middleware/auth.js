const ensureAuthenticated = (req, res, next) => {
  console.log("Authentication Check:");
  console.log("   req.user:", req.user?.email || 'No user');
  console.log("   req.isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : false);

  // Check using Passport's isAuthenticated method
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log("User is authenticated");
    return next();
  }

  console.log("User is NOT authenticated - redirecting to login");
  res.redirect("/login");
};

const ensureAgent = (req, res, next) => {
  console.log("Agent Check:");

  const user = req.user;  // CHANGE THIS - use req.user, not req.session.user
  console.log("  User role:", user ? user.role : "No user");

  if (user && (user.role === "sales_agent" || user.role === "manager")) {
    console.log("User has agent/manager access");
    return next();
  }

  console.log("User does not have agent privileges");
  res.status(404).render("error", {
    title: "Access Denied",
    message: "Access denied. Agent privileges required.",
    user: user,
  });
};

const ensureManager = (req, res, next) => {
  console.log("Manager Check:");

  const user = req.user;  // CHANGE THIS - use req.user
  console.log("   User role:", user ? user.role : "No user");
  console.log("   User isManager:", user ? user.isManager : "No user");

  if (user && user.role === "manager") {
    console.log("User is manager");
    return next();
  }

  console.log("User is NOT manager - redirecting to landing page");
  res.redirect("/index");
};

const ensureSalesAgent = (req, res, next) => {
  console.log("Sales Agent Check:");

  const user = req.user;  // CHANGE THIS - use req.user
  console.log("   User role:", user ? user.role : "No user");

  if (user && user.role === "sales_agent") {
    console.log("User is sales agent");
    return next();
  }

  console.log("User is NOT sales agent");
  res.status(403).render("error", {
    title: "Access Denied",
    message: "Access denied. Sales agent privileges required.",
    user: user,
  });
};

module.exports = {
  ensureAuthenticated,
  ensureAgent,
  ensureManager,
  ensureSalesAgent,
};