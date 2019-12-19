const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from product'),
  allByCat: catId => db.load(`
      select * from product p join categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}`),

  single: id => db.load(`select * from product where ProID = ${id}`),
  getSellerInfo: id => db.load(`CALL getSellerInfo(${id});`),
  getCurrentWinner: id=> db.load(`CALL getCurrentWinner(${id}) `),
  get3TimesLatestPrice: id => db.load(`CALL getInfo3TimesLatestPrice(${id}) `),
  
  add: entity => db.add('product', entity),
  del: id => db.del('product', { ProID: id }),
  patch: entity => {
    const condition = { ProID: entity.ProID };
    delete entity.ProID;
    return db.patch('product', entity, condition);
  }
};