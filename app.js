const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");
const port = process.env.PORT || 3000;
//Router Imports
const onbordingCrawledDataRoute = require("./routers/onbordingCrawledDataRoute");
const clientMonthlyConfigRoute = require("./routers/clientMonthlyConfigRoute");
const userRoute = require("./routers/userRoute");
const authRoute = require("./routers/authRoute");
const osaRoute = require("./routers/osaRoute");
const sentimentRoute = require("./routers/sentimentRoute");
const brandHealthRoute = require("./routers/brandHealthRoute")
const dashboardRoute = require("./routers/dashboardRoute/dashboardRoute");
const productRoute = require("./routers/productRoute");
//db connection
const mongodbConnection = require("./db/mongodb");
mongodbConnection();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/clientMonthlyConfig", clientMonthlyConfigRoute);
app.use("/onbordingCrawledData", onbordingCrawledDataRoute);
app.use("/osa", osaRoute);
app.use("/sentiment", sentimentRoute);
app.use("/brandHealth", brandHealthRoute);
app.use("/dashboard/brandHealth", dashboardRoute);
app.use("/product", productRoute)



app.use("/cookies", (req, res) => {
    console.log(req.cookies);
})
app.get("/Hello", (req, res) => {
    res.cookie("testAuthToken", "iamduplicatetoken", { maxAge: 260000000 });
    res.status(200).json({
        status: "success",
        data: {
            message: "Hello from server, how are you? Have a good day."
        }
    })
})
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