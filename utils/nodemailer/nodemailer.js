const sendMail = async () => {
    "use strict";
    const nodemailer = require("nodemailer");

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
   
        let transporter = nodemailer.createTransport({
            host: "gmail",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "sureshpatel.js@gmail.com", // generated ethereal user
                pass: "patel@0421", // generated ethereal password
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <sureshpatel.js@gmail.com>', // sender address
            to: "sureshpatel.js@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

    main().catch(console.error);
}

module.exports = sendMail;