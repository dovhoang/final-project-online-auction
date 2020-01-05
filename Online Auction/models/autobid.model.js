const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from AutoBid'),
  single: id => db.load(`SELECT * FROM AutoBid WHERE UserID = ${id}`),

  singleByUsername: async name => {
    const user = await db.load1(`AutoBid`, { Username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },

  add: entity => db.add('AutoBid', entity),

  patch: (entity, username) => {
    const condition = { Username: username };
    return db.patch('AutoBid', entity, condition);
  },

  del: id => db.del('AutoBid', { UserID: id }),

};