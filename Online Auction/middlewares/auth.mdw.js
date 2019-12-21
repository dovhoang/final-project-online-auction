module.exports = {
    forUserNotSignIn: (req, res, next) => {
        if (req.session.isAuthenticated === false) {
            req.flash('error_msg', 'Please sign in first')
            return res.redirect(`/account/signin?retUrl=${req.originalUrl}`);
        }
        next();
    }
}