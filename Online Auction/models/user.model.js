const db = require('../utils/db');

module.exports = {
  all: () => { db.load('select * from user'); },
  single: id => db.load(`select * from user where userID = ${id}`),
  singleByUsername: async name => {
    const user = await db.load1(`user`, { username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },
  singleByEmail: async email1 => {
    const user = await db.load1(`user`, { email: email1 })
    if (user.length === 0)
      return null;
    return user[0];
  },
  add: entity => db.add('user', entity),
  del: id => db.del('user', { userID: id }),
};