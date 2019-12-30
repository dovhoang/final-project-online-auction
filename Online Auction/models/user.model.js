const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from Users'),
  //Chọn ra những user là bidder xin nâng cấp hoặc là seller
  allBidderUpgradeAndSeller: () => {
    const sql =
      `SELECT DISTINCT u.*
      FROM Users u LEFT JOIN RequestUpdate ru ON u.Username = ru.Username
      WHERE u.Type = 1 || ru.IsRefuse = -1`;
    return db.load(sql);
  },
  //Chọn ra tất cả các bidder muốn thành seller
  allBidderWantToBeSeller: () => {
    const sql = `SELECT * FROM RequestUpdate WHERE IsRefuse = -1`;
    return db.load(sql);
  },
  //Chọn ra tất cả các seller
  allSeller: () => {
    const sql = `SELECT * FROM Users WHERE Type = 1`;
    return db.load(sql);
  },
  //Đếm seller
  countSeller: () => {
    const sql = `SELECT count(DISTINCT UserID) AS totalSeller FROM Users WHERE Type = 1`;
    return db.load(sql);
  },
  //Đếm Bidder muốn thành seller
  countBidderWantToBeSeller: () => {
    const sql = `SELECT count(DISTINCT Username) AS totalBidder FROM RequestUpdate WHERE IsRefuse = -1`;
    return db.load(sql);
  },
  //Đếm Bidder muốn thành seller và seller 
  countAll: async () => {
    const sql1 = `SELECT count(DISTINCT UserID) AS totalSeller FROM Users WHERE Type = 1`;
    const seller = await db.load(sql1);
    const sql2 = `SELECT count(DISTINCT Username) AS totalBidder FROM RequestUpdate WHERE IsRefuse = -1`;
    const bidderUpgradeSeller = await db.load(sql2);
    return seller[0].totalSeller + bidderUpgradeSeller[0].totalBidder;
  },
  //Đếm số lượng users
  countUsers: async () => {
    const sql = `SELECT COUNT(DISTINCT Username) AS totalUsers FROM Users WHERE Type != 2`;
    return db.load(sql);
  },
  ///Chọn ra tất cả users không là admin
  allUserNotAdmin: () => {
    const sql = `SELECT * FROM Users WHERE Type != 2`;
    return db.load(sql);
  },

  single: id => db.load(`SELECT * FROM Users WHERE UserID = ${id}`),

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

  delByID: id => db.del('Users', { UserID: id }),
};