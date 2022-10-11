const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 5000;
//Router Imports
const clientProductDetailRoute = require("./routers/clientProductDetailRoute");
const clientSellerDetailRoute = require("./routers/clientSellerDetailRoute");
const clientMonthlyConfigRoute = require("./routers/clientMonthlyConfigRoute");
const userRoute = require("./routers/userRoute");
const authRoute = require("./routers/authRoute");
const brandRoute = require("./routers/brandRoute");
const osaRoute = require("./routers/osaRoute");
const sentimentRoute = require("./routers/sentimentRoute");
const brandHealthRoute = require("./routers/brandHealthRoute")
//const brandhealthDashboardRoute = require("./routers/dashboardRoute/brandhealthDashboardRoute");
const campaignReportRoute = require("./routers/dashboardRoute/campaignReportRoute");
const productRoute = require("./routers/productRoute");

const powerBiRoute = require("./routers/powerBi/powerBiRoute");
//db connection
const mongodbConnection = require("./db/mongodb");
mongodbConnection();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/clientMonthlyConfig", clientMonthlyConfigRoute);
app.use("/clientProductDetail", clientProductDetailRoute);
app.use("/clientSellerDetail", clientSellerDetailRoute);
app.use("/brand", brandRoute)
app.use("/osa", osaRoute);
app.use("/sentiment", sentimentRoute);
app.use("/brandHealth", brandHealthRoute);
//app.use("/dashboard/brandHealth", brandhealthDashboardRoute);
app.use("/dashboard/advertisingReport", campaignReportRoute);
app.use("/product", productRoute);
app.use("/powerBi", powerBiRoute);



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
            message
        }

    });
});

app.listen(port, () => {
    console.log(`enlytical app is running on port: ${port}`)
})