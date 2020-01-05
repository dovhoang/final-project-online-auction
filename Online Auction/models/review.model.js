const db = require('../utils/db');


module.exports = {
    getInfoSellerByUserName: username => db.load(`select UserID,concat("****"," ",Lastname) as Name,
    Email,DATE_FORMAT(TimeCreate,'%d/%m/%Y %H:%i:%s') as TimeCreate,RatingUp,RatingDown,
    (select count(*) as total from Product where SellerID=UserID) as TotalProducts
     from Users where Username='${username}'`),
    checkUser: (bidder, seller)  => db.load(`select exists(select * from WonProduct JOIN Product p on p.SellerID=${seller} where WonProduct.UserID=${bidder} and p.ProductID=WonProduct.ProductID) as result`),
    addReviewSeller: (bidder,seller,comment,rate)=>
    db.load(`INSERT INTO reviewbidderseller set Rate=${rate},Type=0,UserID=${bidder},TargetID=${seller},Comment='${comment}',Time=Now()`),
    getReviewSeller:(seller) => db.load(`select rv.Rate,concat(u.FirstName,"",u.LastName) as nameBidder,rv.Comment,
    DATE_FORMAT(rv.Time,'%d/%m/%Y %H:%i:%s') as Time from reviewbidderseller rv 
    join users u on u.UserID=rv.UserID  WHERE rv.Type=0 and rv.TargetID=${seller}`),
    updateRatingUp:(userID)=> db.load(`update Users set Users.RatingUp=Users.RatingUp+1 where Users.UserID=${userID}`),
    updateRatingDown:(userID)=> db.load(`update Users set Users.RatingDown=Users.RatingDown+1 where Users.UserID=${userID}`),
    getID: username => db.load(`select UserID from Users where Username='${username}'`),
    getInfoBidderByUserName: username => db.load(`select UserID,concat("****"," ",Lastname) as Name,
    Email,DATE_FORMAT(TimeCreate,'%d/%m/%Y %H:%i:%s') as TimeCreate,RatingUp,RatingDown, (select count(*) from  WonProduct where UserID=UserID) as CountWonProduct 
    from Users where Username='${username}'`),
    getReviewBidder:(bidder) => db.load(`select rv.Rate,concat(u.FirstName,"",u.LastName) as nameBidder,rv.Comment,
    DATE_FORMAT(rv.Time,'%d/%m/%Y %H:%i:%s') as Time from reviewbidderseller rv 
    join users u on u.UserID=rv.UserID  WHERE rv.Type=1 and rv.TargetID=${bidder}`),
    addReviewBidder: (seller,bidder,comment,rate)=>
    db.load(`INSERT INTO reviewbidderseller set Rate=${rate},Type=1,UserID=${seller},TargetID=${bidder},Comment='${comment}',Time=Now()`)
};
