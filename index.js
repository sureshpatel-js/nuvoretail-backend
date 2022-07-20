const yesterday = new Date("2022-07-15T00:00:00.000+00:00")

 yesterday.setDate(yesterday.getDate() - 1)

console.log(yesterday);