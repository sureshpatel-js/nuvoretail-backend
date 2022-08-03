const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const KeywordDumpSchema = new Schema({
    keyword_rank: {
        type: Number
    },
    keyword: {
        type: String
    },
    sub_cat: {
        type: String
    },
    main_cat: {
        type: String
    },
    brand_id: {
        type: Schema.Types.ObjectId
    },
    time_stamp: {
        type: Date
    }
})

const KeywordDump = mongoose.model("keywordDump", KeywordDumpSchema);
module.exports = KeywordDump;



