const db = require('../utils/db');

module.exports = {
    //Chọn ra tất cả các user yêu cầu update lên seller
    all: () => db.load('select * from RequestUpdate'),
    //Chọn ra những user với là bidder xin nâng cấp hoặc là seller

    ///Chọn ra user yêu cầu update lên seller có Username tương ứng
    single: name => db.load(`select * from RequestUpdate where Username = ${name}`),

    // single1: async (name, isrefuse) => {
    //     const user = await db.load(`select * from RequestUpdate where Username = ${name} && IsRefuse = ${isrefuse}`);
    //     if (user.length === 0)
    //         return null;
    //     return user[0];
    // },

    singleByUsername: async name => {
        const user = await db.load1(`RequestUpdate`, { Username: name })
        if (user.length === 0)
            return null;
        return user[0];
    },

    singleWithCondition: async name => {
        const user = await db.load1(`RequestUpdate`, { Username: name })
        if (user.length === 0)
            return null;
        if (user[0].IsRefuse === -1)
            return user[0];
        else return null;

    },


    add: entity => db.add('RequestUpdate', entity),

    patch: (entity, username) => {
        const condition = { Username: username };
        return db.patch('RequestUpdate', entity, condition);
    },

    del: name => db.del('RequestUpdate', { Username: name }),
};