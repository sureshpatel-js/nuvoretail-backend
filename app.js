const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
//Router Imports
const onbordingCrawledDataRoute = require("./routers/onbordingCrawledDataRoute");
const clientMonthlyConfigRoute = require("./routers/clientMonthlyConfigRoute");
const userRoute = require("./routers/userRoute");
const authRoute = require("./routers/authRoute");
//db connection
const mongodbConnection = require("./db/mongodb");
mongodbConnection();
app.use(express.json());
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/clientMonthlyConfig", clientMonthlyConfigRoute)
app.use("/onbordingCrawledData", onbordingCrawledDataRoute);
app.use((err, req, res, next) => {
    const { status, message } = err;
    res.status(status).json({
        status: "fail",
        data: {
            error: message
        }

    });
});

app.listen(port, () => {
    console.log(`enlytical app is running on port: ${port}`)
})