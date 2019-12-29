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
            return res.redirect('/');
        }
        next();
    },
    forGuestNotEnterEmailRecovery: (req, res, next) => {
        //Nếu session email chưa có 
        //Redirect về trang nhập email recovery
        if (req.session.email === null || req.session.email === undefined) {
            req.flash('error_msg', 'Please enter your email recovery first')
            return res.redirect(`/account/forgotpassword`);
        }
        next();
    },
    forGuestNotEnterOTP: (req, res, next) => {
        //Nếu session isTrueOTP chưa có 
        //Redirect về trang nhập OTP
        if (req.session.isTrueOTP !== true) {
            req.flash('error_msg', 'Please enter otp first')
            return res.redirect(`/account/forgotpassword/otp`);
        }
        next();
    },
    forGuestNotEnterRegisterForm: (req, res, next) => {
        //Nếu session OTP chưa có 
        //Redirect về trang nhập register form
        if (req.session.OTP === null || req.session.OTP === undefined) {
            req.flash('error_msg', 'Please fill out this form')
            return res.redirect(`/account/register`);
        }
        next();
    },
    forUserNotAdmin: (req, res, next) => {
        //Nếu không là admin hoặc chưa đăng nhập
        if (req.session.isAuthenticated === false || req.session.authUser.Type !== 2) {
            return res.redirect('/');
        }
        next();
    },
    forAdmin: (req, res, next) => {
        //Nếu là admin
        if (req.session.authUser.Type === 2) {
            return res.redirect('/');
        }
        next();
    },

    forUserNotSeller: (req, res, next) => {
        //Nếu không là seller
        if (req.session.authUser === undefined || req.session.authUser.Type !== 1) {
            return res.redirect('/');
        }
        next();
    }
}