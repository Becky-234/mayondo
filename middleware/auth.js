//ENSURE USER IS AUTHENTICATED
exports.ensureAuthenticated = (req,res,next) => {
    if(req.session.user) {
        return next()
    }
    res.redirect('/login')
}

//ENSURE USER IS A SALES AGENT
exports.ensureAgent = (req, res, next) => {
    if (req.session.user && req.session.user.role === "Sales agent") {
        return next()
    }
    res.redirect('/index')
}

//ENSURE USER IS A MANAGER
exports.ensureManager = (req, res, next) => {
    if (req.session.user && req.session.user.role === "Manager") {
        return next()
    }
    res.redirect('/index')
}