
const osaJson = require("./zzdata/curatio_osa_14_07_2022.json");
const axios = require("axios");
let brandHealthJson = require("./zzdata/curatio_brandhealth_14_07_2022.json");
// brandHealthJson = [brandHealthJson[0]]
const removeSpecialSymbol = (numString, symbolArray) => {
    let num = "";
    const numStringArray = numString.split("");
    numStringArray.forEach((e) => {
        if (!symbolArray.includes(e)) {
            num = num + e;
        }
    })
    return num * 1;
}


const dataArray = [{
    "time_stamp": "2022-07-14T00:00:00",
    "platform_code": "B07BGG9T13",
    "platform": "Amazon",
    "sp": "₹320.00",
    "rating": "4.5 out of 5",
    "status_text": "Add to Cart",
    "seller": "KarissaKart®",
    "screenshot_url": "https://nrscuratio.blob.core.windows.net/cont/140722_amazon_B07BGG9T13_110038.png",
    "deal": null,
    "sns": null,
    "coupon": null,
    "main_cat": "Beauty",
    "main_cat_rank": "5327",
    "sub_cat": "Face Wash",
    "sub_cat_rank": "378",
    "defaultasin": "B07BGG9T13",
    "expiry_date": null,
    "delivery_days": "7",
    "location": "110038",
    "prod_url": "https://www.amazon.in/dp/B07BGG9T13"
}]

//osa
const fn1 = async () => {
    for await (const el of osaJson) {
        let time_stamp = el.time_stamp.split("T")[0];
        let sp = removeSpecialSymbol(el.sp, ["₹", ","]);
        let rating = (el.rating.split(" ")[0]) * 1;
        let status = el.status_text === "Add to Cart" ? true : false;
        let main_cat_rank = removeSpecialSymbol(el.main_cat_rank, [","]);
        let sub_cat_rank = removeSpecialSymbol(el.sub_cat_rank, [","]);
        delete el.status_text;
        let data = {
            ...el, time_stamp, sp, rating, status, main_cat_rank, sub_cat_rank
        }

        axios.post("http://localhost:3000/osa", data).then(function (response) {
            console.log("success");
        })
            .catch(function (error) {
                console.log("error");
            });

    }
}
//fn1()














const fn = () => {
    brandHealthJson.forEach(async (el) => {
        let time_stamp = el.time_stamp.split("T")[0];
        let rank = el.rank !== null ? removeSpecialSymbol(el.rank, [","]) : null;
        let rating = (el.rating.split(" ")[0]) * 1;
        let no_of_rating = removeSpecialSymbol(el.no_of_rating.split(" ")[0], [","]);
        let no_of_review = removeSpecialSymbol(el.no_of_review.split(" ")[0], [","]);
        let cust_rating = el.cust_rating !== null ? removeSpecialSymbol(el.cust_rating.split(" ")[0], [","]) : null
        const data = {
            ...el, time_stamp, rank, rating, no_of_rating, no_of_review, cust_rating
        }
        try {
            const res = await axios.post("http://localhost:3000/brandHealth", data);
            console.log("success")
        } catch (error) {
            console.log(error.message);
            
        }
    })
    // for await (const el of brandHealthJson) {


    // }
}
//fn()



