const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from BlackList'),
  single: id => db.load(`SELECT * FROM BlackList WHERE UserID = ${id}`),

  singleByUsername: async name => {
    const user = await db.load1(`BlackList`, { Username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },

  add: entity => db.add('BlackList', entity),

  patch: (entity, username) => {
    const condition = { Username: username };
    return db.patch('BlackList', entity, condition);
  },

  del: id => db.del('BlackList', { UserID: id }),

};