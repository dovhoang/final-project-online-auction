const db = require('../utils/db');
const config = require('../config/default.json');

module.exports = {
  all: () => db.load('select * from Product'),
  allTimeExpExceptIsOver: () => db.load('SELECT ProductID,ProductName,SellerID,CurrentBid, PriceStart ,TimeExp FROM Product WHERE IsOver = 0'),
  allBySellerID: sellerid => {
    const sql = `SELECT * FROM Product WHERE SellerID = ${sellerid}`;
    return db.load(sql);
  },
  singleByProID: async proid => {
    const product = await db.load1(`Product`, { ProductID: proid })
    if (product.length === 0)
      return null;
    return product[0];
  },
  allWithBidInfo: _ => db.load(`
  SELECT p3.ProductID, p3.ProductName, p3.PriceStart,p3.PricePurchase,
  p3.TimeExp, p3.NumBid,p3.CurrentWinner, p3.TimePost,p3.CatName, concat("***** ", u.LastName) as WinnerName,
  (CASE WHEN TIME_TO_SEC(timediff(NOW(),p3.TimePost))<86400 THEN 1 ELSE 0 END) as isNew
  FROM (SELECT p2.ProductID, p2.ProductName, p2.PriceStart,p2.PricePurchase,p2.TimeExp, p2.NumBid,p2.CurrentWinner, p2.TimePost, c.CatName
        FROM (SELECT p1.ProductID,p1.CatID, p1.ProductName, p1.PriceStart,p1.PricePurchase,
              p1.TimeExp, p1.CurrentWinner, p1.TimePost, COUNT(b.BidID) as NumBid
              FROM Bid b RIGHT JOIN Product p1 ON b.ProID = p1.ProductID
              GROUP BY p1.ProductID,p1.CatID, p1.ProductName, p1.PriceStart,p1.PricePurchase,
              p1.TimeExp, p1.CurrentWinner, p1.TimePost) p2, Categories c
        WHERE p2.CatID = c.CatID and timediff(p2.TimeExp,NOW())>0) p3 
  LEFT JOIN Users u
  ON u.UserID = p3.CurrentWinner`),
  allProductWithSellerID: sellerid => {
    const sql = `SELECT ProductID FROM Product WHERE SellerID = ${sellerid}`;
    return db.load(sql);
  },
  getLargestProID: () => {
    const sql = `SELECT MAX(ProductID) as ProId FROM Product`;
    return db.load(sql);
  },
  delBySellerID: sellerid => {
    db.del('Product', { SellerID: sellerid });
  },
  allByCat: catId => db.load(`
      select * from Product p join Categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}`),
  countByCat: async catId => {
    const rows = await db.load(`
    select count(p.ProductID) as total 
    from Product p join Categories c
    on p.CatID = c.CatID and timediff(p.TimeExp,NOW())>0
    where p.CatID = ${catId} 
    and ((p.CatID = c.CatID  and c.ParentID != 0) or  (p.CatID = c.CatID and c.ParentID = ${catId}))`)
    return rows[0].total;
  },
  pageByCat: (catId, offset, sortby, order) => db.load(`
  SELECT p3.ProductID, p3.ProductName, p3.PriceStart,p3.PricePurchase,
  p3.TimeExp, p3.NumBid,p3.CurrentWinner, p3.TimePost, concat("***** ", u.LastName) as WinnerName,
  (CASE WHEN TIME_TO_SEC(timediff(NOW(),p3.TimePost))<86400 THEN 1 ELSE 0 END) as isNew
  FROM (SELECT p2.ProductID, p2.ProductName, p2.PriceStart,p2.PricePurchase,p2.TimeExp, p2.NumBid,p2.CurrentWinner, p2.TimePost
        FROM (SELECT p1.ProductID,p1.CatID, p1.ProductName, p1.PriceStart,p1.PricePurchase,
              p1.TimeExp, p1.CurrentWinner, p1.TimePost, COUNT(b.BidID) as NumBid
              FROM Bid b RIGHT JOIN Product p1 ON b.ProID = p1.ProductID
              GROUP BY p1.ProductID,p1.CatID, p1.ProductName, p1.PriceStart,p1.PricePurchase,
              p1.TimeExp, p1.CurrentWinner, p1.TimePost) p2, Categories c
        WHERE p2.CatID = c.CatID and (p2.CatID = ${catId} or c.ParentID = ${catId}) and timediff(p2.TimeExp,NOW())>0
        ORDER BY p2.${sortby} ${order}
        LIMIT ${config.paginate.limit} offset ${offset}) p3 
  LEFT JOIN Users u
  ON u.UserID = p3.CurrentWinner`
  ),
  getCategoryNameById: async id => {
    const rows = await db.load(`select CatName from Categories where CatID = ${id}`)
    return rows[0].CatName;
  },
  single: id => db.load(`CALL getSingleProduct(${id})`),
  getCateParent: id =>db.load(`select c2.CatID,c2.CatName from Product p, Categories c1,Categories c2
  where p.CatID = c1.CatID and c1.ParentID = c2.CatID`),
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
  fInsertFavorite: (proID, userID) => db.load(` SELECT fInsertFavorite(${proID}, ${userID}) AS result`),
  getFinishedProducts: userID => db.load(`CALL getAllFinishedProducts(${userID}) `),
  add: entity => db.add('Product', entity),
  addReview: entity => db.add('Review', entity),
  del: id => db.del('Product', { ProID: id }),

  delInFav: (pid, uid) => db.load(`delete from Favorite where ProductID=${pid} and UserID=${uid}`),
  patch: entity => {
    const condition = { ProductID: entity.ProID };
    delete entity.ProID;
    return db.patch('Product', entity, condition);
  },
  patch2: (entity, condition) => {
    return db.patch('Product', entity, condition);
  }
};