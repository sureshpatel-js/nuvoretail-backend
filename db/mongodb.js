const mongoose = require("mongoose");
const mongodbConnection = async () => {
  mongoose
    .connect(
      //"mongodb+srv://admin:VuYGz7hbDyIwIAQU@enlytical.jcwjb.mongodb.net/?retryWrites=true&w=majority"
      "mongodb://localhost:27017/enlytical-web-toolkit-testing"
    ).then(() => {
      console.log("connected to DB.");
    })
    .catch((error) => {
      console.log(`connection with DB error====>${error}`);
    });
}

module.exports = mongodbConnection;