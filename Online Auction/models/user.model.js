const db = require('../utils/db');

module.exports = {
  all: () => { db.load('select * from user'); },
  single: id => db.load(`select * from user where userID = ${id}`),
  single1: name => db.load1(`user`, { username: name }),
  add: entity => db.add('user', entity),
  del: id => db.del('user', { userID: id }),
};