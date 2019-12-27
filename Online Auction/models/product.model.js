const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from Product'),
  allByCat: catId => db.load(`
      select * from Product p join Categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}`),

  single: id => db.load(`CALL getSingleProduct(${id})`),
  getSellerInfo: id => db.load(`CALL getSellerInfo(${id});`),
  getCurrentWinner: id=> db.load(`CALL getCurrentWinner(${id}) `),
  get3TimesLatestPrice: id => db.load(`CALL getInfo3TimesLatestPrice(${id}) `),
  getReview: (id) => db.load(`CALL getReview(${id})`),
  get5RelatedProduct: id=>db.load (`CALL get5RelatedProduct(${id})`),
  getTop5ToEnd: _ => db.load(`CALL getTop5ToEnd()`),
  getTop5PopularBid: _ => db.load(`CALL getTop5PopularBid()`),
  getTop5Price: _ => db.load(`CALL getTop5Price()`),

  fAuction: (proID,userID,price)=>db.load(` SELECT Auction(${proID}, ${userID}, ${price}) AS Auction`),
  add: entity => db.add('Product', entity),
  addBid: entity => db.add('Bid', entity),
  addReview: entity => db.add('Review',entity),
  del: id => db.del('Product', { ProID: id }),
  patch: entity => {
    const condition = { ProID: entity.ProID };
    delete entity.ProID;
    return db.patch('Product', entity, condition);
  }
};