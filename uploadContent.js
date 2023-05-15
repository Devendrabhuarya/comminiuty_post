const mongoose = require("mongoose");
mongoose.connect("mongodb://0.0.0.0:27017/ComminiutyAppContent", { useNewUrlParser: true }).then(() => {
    console.log("connected");
});
mongoose.set('strictQuery', false);