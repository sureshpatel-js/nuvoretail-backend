exports.calculateChange = (numDiff) => {
    let change;
    if (numDiff > 0) {
        change = "positive"
    } else if (numDiff < 0) {
        change = "negative"
    } else if (numDiff === 0) {
        change = "zero"
    }
    return change;
}

exports.calculateNegativeOfChange = (numDiff) => {
    let change;
    if (numDiff < 0) {
        change = "positive"
    } else if (numDiff > 0) {
        change = "negative"
    } else if (numDiff === 0) {
        change = "zero"
    }
    return change;
}

exports.calculateProductDeal = (mrp, sp) => {
    const promo_percentage = ((mrp - sp) / mrp) * 100;
    return promo_percentage;
}

