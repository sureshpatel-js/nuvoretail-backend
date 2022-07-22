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