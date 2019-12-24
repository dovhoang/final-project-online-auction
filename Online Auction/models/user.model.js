const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from user'),
  //Chọn ra những user với là bidder xin nâng cấp hoặc là seller
  allWithCondition1: () => {
    const sql = `select * from user where ((type = 0 && isUpgrade = 1) || type = 1)`;
    return db.load(sql);
  },
  ///Chọn ra tất cả users không là admin
  allWithCondition2: () => {
    const sql = `select * from user where type != 2`;
    return db.load(sql);
  },

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

  singleByUserID: async id => {
    const user = await db.load1(`user`, { userID: id })
    if (user.length === 0)
      return null;
    return user[0];
  }, 
  add: entity => db.add('user', entity),

  patch: (entity, username) => {
    const condition = { username: username };
    console.log(condition);
    return db.patch('user', entity, condition);
  },
  // patchPassword: (entity,username) => {
  //   const condition = { username: username };
  //   entity.password = entity.newpassword;
  //   delete entity.oldpassword;
  //   delete entity.newpassword;
  //   delete entity.confirmpassword;
  //   return db.patch('user', entity, condition);
  // },
  del: id => db.del('user', { userID: id }),
  delByName: name => db.del('user',{username: name}),
};