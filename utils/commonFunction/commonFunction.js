exports.roundOffToTwoDecimal = (num) => {
    const result = Math.round(num * 100) / 100;
    return result;
}

exports.addNumbersInArray = (arr) => {
    var sum = arr.reduce(function (x, y) {
        return x + y;
    }, 0);
    return sum;
}
exports.calculatePercentageChange = (initial, final) => {

    if (initial === final) {
        return 0
    } else if (final > 0 && initial === 0) {
        return final * 100;
    } else if (final === 0 && initial > 0) {
        return -100
    } else {
        return (final - initial) / initial * 100
    }
}

exports.divTwoNum = (num, den) => {
    if (num === 0 && den === 0) {
        return 0;
    } else if (num === 0 && den > 0) {
        return 0;
    } else if (num > 0 && den === 0) {
        return num / 1;
    } else {
        return num / den;
    }
}

exports.getMontheInText = (monthInNumber) => {
    const monthObj = {
        "1": "Jan",
        "2": "Feb",
        "3": "Mar",
        "4": "Apr",
        "5": "May",
        "6": "Jun",
        "7": "Jul",
        "8": "Aug",
        "9": "Sep",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
    }
    const month = `${monthInNumber}`;
    return monthObj[month];
}


exports.getYesterdayAndFirstDayOfMonth = (time_stamp) => {
    const yesterday = new Date(time_stamp);
    yesterday.setDate(yesterday.getDate() - 1);
    let firstDayOfMonth;
    if (yesterday.getDate() === 1) {
        firstDayOfMonth = new Date(yesterday);
    } else {
        const date = new Date(yesterday)
        firstDayOfMonth = new Date(date.setDate(date.getDate() - (date.getDate() - 1)));
    }

    return { yesterday, firstDayOfMonth }
}
exports.getDaysInMonth = (time_stamp) => {
    const date = new Date(time_stamp)
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    //console.log(year, month)
    return new Date(year, month, 0).getDate()
}