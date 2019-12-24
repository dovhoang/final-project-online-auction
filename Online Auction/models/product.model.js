const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from Products'),
  allByCat: catId => db.load(`
      select * from Products p join Categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}`),

  single: id => db.load(`CALL getSingleProduct(${id})`),
  getSellerInfo: id => db.load(`CALL getSellerInfo(${id});`),
  getCurrentWinner: id=> db.load(`CALL getCurrentWinner(${id}) `),
  get3TimesLatestPrice: id => db.load(`CALL getInfo3TimesLatestPrice(${id}) `),
  getReview: id=> db.load(`CALL getReview(${id})`),
  get5RelatedProduct: id=>db.load (`CALL get5RelatedProduct(${id})`),
  add: entity => db.add('Products', entity),
  addBid: entity => db.add('Bid', entity),
  del: id => db.del('Products', { ProID: id }),
  patch: entity => {
    const condition = { ProID: entity.ProID };
    delete entity.ProID;
    return db.patch('Products', entity, condition);
  }
};