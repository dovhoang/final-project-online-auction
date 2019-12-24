const db = require('../utils/db');

module.exports = {
  all: () => db.load('select * from Users'),
  //Chọn ra những user với là bidder xin nâng cấp hoặc là seller
  allWithCondition1: () => {
    const sql = `select * from Users where ((Type = 0 && IsUpgrade = 1) || Type = 1)`;
    return db.load(sql);
  },
  ///Chọn ra tất cả users không là admin
  allWithCondition2: () => {
    const sql = `select * from Users where type != 2`;
    return db.load(sql);
  },

  single: id => db.load(`select * from Users where UserID = ${id}`),
  singleByUsername: async name => {
    const user = await db.load1(`Users`, { username: name })
    if (user.length === 0)
      return null;
    return user[0];
  },
  singleByEmail: async email1 => {
    const user = await db.load1(`Users`, { email: email1 })
    if (user.length === 0)
      return null;
    return user[0];
  },

  singleByUserID: async id => {
    const user = await db.load1(`Users`, { userID: id })
    if (user.length === 0)
      return null;
    return user[0];
  }, 
  add: entity => db.add('Users', entity),

  patch: (entity, username) => {
    const condition = { username: username };
    console.log(condition);
    return db.patch('Users', entity, condition);
  },
  // patchPassword: (entity,username) => {
  //   const condition = { username: username };
  //   entity.password = entity.newpassword;
  //   delete entity.oldpassword;
  //   delete entity.newpassword;
  //   delete entity.confirmpassword;
  //   return db.patch('user', entity, condition);
  // },
  del: id => db.del('Users', { userID: id }),
  delByName: name => db.del('Users',{username: name}),
};