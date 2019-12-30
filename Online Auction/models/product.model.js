const db = require('../utils/db');
const config = require('../config/default.json');

module.exports = {
  all: () => db.load('select * from Product'),
  getLargestProID: () => {
    const sql = `SELECT MAX(ProductID) as ProId FROM Product`;
    return db.load(sql);
  },
  delBySellerID: sellerid => {
    db.del('Product', { SellerID: sellerid });
  },
  // getProductOfSeller: sellerid => {
  //   const sql = `SELECT `
  // },
  allByCat: catId => db.load(`
      select * from Product p join Categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}`),
  countByCat: async catId => {
    const rows = await db.load(`
    select count(p.ProductID) as total 
    from Product p join Categories c
    on p.CatID = c.CatID
    where p.CatID = ${catId} and p.CatID = c.CatID  and c.ParentID != 0
    or  (p.CatID = c.CatID and c.ParentID = ${catId})`)
    return rows[0].total;
  },
  pageByCat: (catId, offset) => db.load(`
  select * from Product p join Categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}
      limit ${config.paginate.limit} offset ${offset}`),
  single: id => db.load(`CALL getSingleProduct(${id})`),
  getSellerInfo: id => db.load(`CALL getSellerInfo(${id});`),
  getCurrentWinner: id => db.load(`CALL getCurrentWinner(${id}) `),
  get3TimesLatestPrice: id => db.load(`CALL getInfo3TimesLatestPrice(${id}) `),
  getReview: (id) => db.load(`CALL getReview(${id})`),
  get5RelatedProduct: id => db.load(`CALL get5RelatedProduct(${id})`),
  getTop5ToEnd: _ => db.load(`CALL getTop5ToEnd()`),
  getTop5PopularBid: _ => db.load(`CALL getTop5PopularBid()`),
  getTop5Price: _ => db.load(`CALL getTop5Price()`),
  getFavoriteProduct: userID => db.load(`CALL getFavoriteProduct(${userID})`),
  getWonProduct: userID => db.load(`CALL getWonProduct(${userID})`),
  getProductRecently: userID => db.load(`CALL getProductRecently(${userID})`),
  fvr: (id, userID) => db.load(`Select * from Favorite where ProductID=${id} and UserID=${userID}`),
  fAuction: (proID, userID, price) => db.load(` SELECT fAuction(${proID}, ${userID}, ${price}) AS Auction`),
  fInsertFavorite: (proID, userID) => db.load(` SELECT fInsertFavorite(${proID}, ${userID}) AS result`),
  checkBlock: (proID, userID) => db.load(`select exists(select ProductID from BlackList where UserID=${userID} and
     ProductID=${proID}) as isBlocked`),
  add: entity => db.add('Product', entity),
  addBid: entity => db.add('Bid', entity),
  addReview: entity => db.add('Review', entity),
  del: id => db.del('Product', { ProID: id }),

  delInFav: (pid, uid) => db.load(`delete from Favorite where ProductID=${pid} and UserID=${uid}`),
  patch: entity => {
    const condition = { ProID: entity.ProID };
    delete entity.ProID;
    return db.patch('Product', entity, condition);
  }
};