//ENSURE USER IS AUTHENTICATED
exports.ensureAuthenticated = (req,res,next) => {
    if(req.session.user || req.user) {
        return next()
    }
    res.redirect('/login')
}

//ENSURE USER IS A SALES AGENT
exports.ensureAgent = (req, res, next) => {
    const user = req.session.user || req.user;
    if (user && user.role === "Sales agent") {
        return next()
    }
    res.redirect('/')
}

//ENSURE USER IS A MANAGER
exports.ensureManager = (req, res, next) => {
    const user = req.session.user || req.user;
    if (user && user.role === "Manager") {
        return next()
    }
    res.redirect('/')
}