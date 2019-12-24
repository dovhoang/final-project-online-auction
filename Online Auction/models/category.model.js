const db = require('../utils/db');

module.exports = {
    all: _ => {
    const sql = `
      select c.CatID, c.CatName, c.ParentID, p.CatName as ParentName
      from Categories c left join Categories p on c.ParentID = p.CatID
      group by c.CatID, c.CatName, p.CatName`;
    return db.load(sql);
    },
    single: id => db.load(`select * from Categories where CatID = ${id}`),
    add: entity => db.add('Categories', entity),
    del: id => db.del('Categories', { CatID: id }),
    patch: entity => {
      const condition = { CatID: entity.CatID };
      delete entity.CatID;
      return db.patch('Categories', entity, condition);
    },
    allWithDetails: _ => {
      const sql = `
        select c.CatID, c.CatName, count(p.ProductID) as num_of_products
        from Categories c left join Products p on c.CatID = p.CatID
        group by c.CatID, c.CatName`;
      return db.load(sql);
    },
    allCatLevel1: _ => {
      const sql = `
        select CatID, CatName
        from Categories
        where ParentID = 0`;
      return db.load(sql);
    },
};