const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from Users'),
  //Chọn ra những user với là bidder xin nâng cấp hoặc là seller
  allWithCondition1: () => {
    const sql = `select * from Users where ((Type = 0 && IsUpgrade = 1) || Type = 1)`;
    return db.load(sql);
  },
  allBidderWantToBeSeller: () => {
    const sql = `select * from Users where (Type = 0 && IsUpgrade = 1)`;
    return db.load(sql);
  },
  allSeller: () => {
    const sql = `select * from Users where Type = 1`;
    return db.load(sql);
  },

  countSeller: () => {
    const sql = `select count(*) as totalSeller from Users where Type = 1`;
    return db.load(sql);
  },

  countBidderWantToBeSeller: () => {
    const sql = `select count(*) as totalBidder from Users where (Type = 0 && IsUpgrade = 1)`;
    return db.load(sql);
  },

  countAll: () => {
    const sql = `select count(*) as total from Users where ((Type = 0 && IsUpgrade = 1) || Type = 1)`;
    return db.load(sql);
  },
  ///Chọn ra tất cả users không là admin
  allWithCondition2: () => {
    const sql = `select * from Users where Type != 2`;
    return db.load(sql);
  },

  single: id => db.load(`select * from Users where UserID = ${id}`),

  singleByUsername: async name => {
    const user = await db.load1(`Users`, { Username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },
  singleByEmail: async email1 => {
    const user = await db.load1(`Users`, { Email: email1 })
    if (user.length === 0)
      return null;
    return user[0];
  },

  singleByUserID: async id => {
    const user = await db.load1(`Users`, { UserID: id })
    if (user.length === 0)
      return null;
    return user[0];
  },
  add: entity => db.add('Users', entity),

  patch: (entity, username) => {
    const condition = { Username: username };
    return db.patch('Users', entity, condition);
  },

  del: id => db.del('Users', { UserID: id }),

  delByName: name => db.del('Users', { Username: name }),
};