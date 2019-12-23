module.exports = {
    forUserNotSignIn: (req, res, next) => {
        if (req.session.isAuthenticated === false) {
            req.flash('error_msg', 'Please sign in first')
            return res.redirect(`/account/signin?retUrl=${req.originalUrl}`);
        }
        next();
    },
    forUserSignIn: (req, res, next) => {
        if (req.session.isAuthenticated === true) {
            // req.flash('error_msg', 'Please sign in first')
            return res.redirect(`/`);
        }
        next();
    },
    forGuestNotEnterEmailRecovery: (req,res,next) =>{
        //Nếu session email chưa có 
        //Redirect về trang nhập email recovery
        if (req.session.email === null || req.session.email === undefined) {
            req.flash('error_msg', 'Please enter your email recovery first')
            return res.redirect(`/account/forgotpassword`);
        }
        next();
    },
    forGuestNotEnterOTP: (req,res,next) =>{
        //Nếu session isTrueOTP chưa có 
        //Redirect về trang nhập OTP
        if (req.session.isTrueOTP !== true) {
            req.flash('error_msg', 'Please enter otp first')
            return res.redirect(`/account/forgotpassword/otp`);
        }
        next();
    },

}