module.exports = {
    interChangeSort: (array, order, sortby) => {
        if (sortby === 0) {//Sort price start
            if (order === 0) {
                for (let i = 0; i < array.length - 1; i++) {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].original.PriceStart < array[i].original.PriceStart) {
                            let t = array[i];
                            array[i] = array[j];
                            array[j] = t;
                        }
                    }
                }
            } else if (order === 1) {
                for (let i = 0; i < array.length - 1; i++) {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].original.PriceStart > array[i].original.PriceStart) {
                            let t = array[i];
                            array[i] = array[j];
                            array[j] = t;
                        }
                    }
                }
            }
        } else if (sortby === 1) {// sort time exp
            if (order === 0) {
                for (let i = 0; i < array.length - 1; i++) {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].original.TimeExp < array[i].original.TimeExp) {
                            let t = array[i];
                            array[i] = array[j];
                            array[j] = t;
                        }
                    }
                }
            } else if (order === 1) {
                for (let i = 0; i < array.length - 1; i++) {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].original.TimeExp > array[i].original.TimeExp) {
                            let t = array[i];
                            array[i] = array[j];
                            array[j] = t;
                        }
                    }
                }
            }
        } else if (sortby === 2) {//sort num bid
             if (order === 1) {
                for (let i = 0; i < array.length - 1; i++) {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].original.NumBid > array[i].original.NumBid) {
                            let t = array[i];
                            array[i] = array[j];
                            array[j] = t;
                        }
                    }
                }
            }
        } else if (sortby === 3) {//sort time post
            if (order === 0) {
                for (let i = 0; i < array.length - 1; i++) {
                    for (let j = i + 1; j < array.length; j++) {
                        if (array[j].original.TimePost < array[i].original.TimePost) {
                            let t = array[i];
                            array[i] = array[j];
                            array[j] = t;
                        }
                    }
                }
            }
        }
    },
};