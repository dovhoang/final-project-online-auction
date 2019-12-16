const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from product'),
  allByCat: catId => db.load(`
      select * from product p join categories c
      on p.CatID = c.CatID
      where p.CatID = ${catId} or c.ParentID = ${catId}`),

  single: id => db.load(`select * from product where ProID = ${id}`),
  add: entity => db.add('product', entity),
  del: id => db.del('product', { ProID: id }),
  patch: entity => {
    const condition = { ProID: entity.ProID };
    delete entity.ProID;
    return db.patch('product', entity, condition);
  }
};