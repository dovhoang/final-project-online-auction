const nodemailer = require('nodemailer');
module.exports = {
    sendMail: (receiveEmail, emailSubject, htmlText) => {
        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: 'gmail',
            auth: {
                user: 'onlineauction2222@gmail.com',
                pass: 'onlineauction'
            }
        });
        var mailOptions = {
            from: 'onlineauction2222@gmail.com',
            to: receiveEmail,
            subject: emailSubject,
            text: 'You recieved message from ' + receiveEmail,
            html: htmlText,
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err);
                return false;
            } else {
                return true;
            }
        });
    },
}