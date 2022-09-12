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