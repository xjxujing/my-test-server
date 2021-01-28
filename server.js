const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require('cors');
const app = express();

const users = require("./routes/api/users");
const profiles = require("./routes/api/profiles");
const upload = require("./routes/api/upload");
const dirs = require("./routes/api/dirs");


// db config
const db = require("./config/keys").mongoURI;

app.use(cors());

// 使用 bodyParser 中间件
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 创建 application/x-www-form-urlencoded 解析
// app.use(bodyParser.urlencoded({ extended: false }));

// 解析 json数据
// app.use(bodyParser.json());

// 使用 passport
app.use(passport.initialize());
require("./config/passport")(passport);

// connect to mongodb
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => console.log("successes! MongoDB Connected"),
    (err) => console.log('error!', err)
);

app.get("/", (req, res) => {
    res.send("Hello node!");
});

// 使用 routes
app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/upload", upload);
app.use("/api/dirs", dirs);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server runing on port ${port}`);
});
