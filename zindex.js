const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://admin:VuYGz7hbDyIwIAQU@enlytical.jcwjb.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

(async () => {
    const user = await client.db("test").collection("users");
    const u = await user.findOne({"_id":  ObjectId("62c295304bb0d538821998c")});
    console.log(u);
})()


