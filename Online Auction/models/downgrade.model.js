const db = require('../utils/db');

module.exports = {
    //Chọn ra tất cả các seller
    all: () => db.load('select * from Downgrade'),
    
    ///Chọn ra seller có Username tương ứng
    single: name => db.load(`select * from Downgrade where Username = ${name}`),

    singleByUsername: async name => {
        const user = await db.load1(`Downgrade`, { Username: name })
        if (user.length === 0)
            return null;
        return user[0];
    },

    add: entity => db.add('Downgrade', entity),

    patch: (entity,username) => {
        const condition = { Username: username };
        return db.patch('Downgrade', entity, condition);
    },

    del: name => db.del('Downgrade', { Username: name }),
};