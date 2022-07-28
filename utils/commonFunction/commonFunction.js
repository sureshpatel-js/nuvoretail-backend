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