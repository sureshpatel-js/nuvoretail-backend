const mongoose = require("mongoose");
const mongodbConnection = ()=>{
    mongoose
  .connect(
    "mongodb+srv://admin:VuYGz7hbDyIwIAQU@enlytical.jcwjb.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Mongodb connection success.");
  })
  .catch((error) => {
    console.log(`Mongodb connection error====>${error}`);
  });
}

module.exports = mongodbConnection;