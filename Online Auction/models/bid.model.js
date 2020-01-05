const db = require('../utils/db');

module.exports = {
  all: () => db.load('SELECT * FROM Bid'),
  getLargestPriceBidOnProduct: async (proid) => {
    const sql = `SELECT MAX(Amount) as larghestamount FROM Bid WHERE ProID = ${proid}`
    const bid = await db.load(sql);
    const sql1 = `SELECT * FROM Bid WHERE ProID=${proid} and Amount= ${bid[0].larghestamount}`
    const bid1 = await db.load(sql1);
    if (bid1.length === 0)
      return null;
    return bid1[0];
  },
  singleByProIDAndAmount: async (proid, amount) => {
    const sql = `SELECT UserID FROM Bid WHERE ProID = ${proid} and Amount = ${amount}`
    const bid = await db.load(sql);
    return bid[0];
  },

  singleByUserID: async userid => {
    const bid = await db.load1(`Bid`, { UserID: userid })
    if (bid.length === 0)
      return null;
    return bid[0];
  },
  singleByProID: async userid => {
    const bid = await db.load1(`Bid`, { UserID: userid })
    if (bid.length === 0)
      return null;
    return bid[0];
  },
  fAuction: (proID, userID, price) => db.load(` SELECT fAuction(${proID}, ${userID}, ${price}) AS Auction`),
  addBid: entity => db.add('Bid', entity),
  checkBlock: (proID, userID) => db.load(`select exists(select ProductID from BlackList where UserID=${userID} and
    ProductID=${proID}) as isBlocked`),
  fAutoBid: (proID, userID, price) => db.load(` SELECT fAutoBid(${proID}, ${userID}, ${price}) AS autoBid`),
  add: entity => db.add('Bid', entity),
  MaxPrice: (proID, userID) => db.load(`Select Price from AutoBid where ProductID=${proID} and UserID=${userID}
    order by Price desc limit 1`),
  getScore: (userID) => db.load(`Select (case when (Ratingup<>0 OR Ratingdown<>0) then Ratingup/(Ratingup+Ratingdown) else -1 end)  as score
  ,Ratingup,Ratingdown from Users where UserID=${userID}`),
  patch: (entity, bidid) => {
    const condition = { BidID: bidid };
    return db.patch('Bid', entity, condition);
  },
  //Xóa những lần bid có UserID
  delByUserID: userid => db.del('Bid', { UserID: userid }),

  //Xóa những lần bid có ProID
  delByProID: proid => db.del('Bid', { ProID: proid }),
};