const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from Favorite'),
  single: id => db.load(`SELECT * FROM Favorite WHERE UserID = ${id}`),

  singleByUsername: async name => {
    const user = await db.load1(`Favorite`, { Username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },

  add: entity => db.add('Favorite', entity),

  patch: (entity, username) => {
    const condition = { Username: username };
    return db.patch('Favorite', entity, condition);
  },

  del: id => db.del('Favorite', { UserID: id }),

};