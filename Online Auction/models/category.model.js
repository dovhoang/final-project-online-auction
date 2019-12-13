const db = require('../utils/db');

module.exports = {
    all: _ => {
    const sql = `
      select c.CatID, c.CatName, p.CatName as ParentName
      from categories c left join categories p on c.ParentID = p.CatID
      group by c.CatID, c.CatName, p.CatName`;
    return db.load(sql);
    },
    single: id => db.load(`select * from categories where CatID = ${id}`),
    add: entity => db.add('categories', entity),
    del: id => db.del('categories', { CatID: id }),
    patch: entity => {
      const condition = { CatID: entity.CatID };
      delete entity.CatID;
      return db.patch('categories', entity, condition);
    },
};