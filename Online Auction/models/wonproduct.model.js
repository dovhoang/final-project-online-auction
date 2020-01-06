const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from WonProduct'),
  single: id => db.load(`SELECT * FROM WonProduct WHERE UserID = ${id}`),

  singleByUsername: async name => {
    const user = await db.load1(`WonProduct`, { Username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },

  add: entity => db.add('WonProduct', entity),

  patch: (entity, username) => {
    const condition = { Username: username };
    return db.patch('WonProduct', entity, condition);
  },

  del: id => db.del('WonProduct', { UserID: id }),

};