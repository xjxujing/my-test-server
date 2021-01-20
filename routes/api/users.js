// @login & register
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const keys = require("../../config/keys");
const User = require("../../models/User");
const passpost = require("passport");

const STATUS = {
    SUCCESS: '0',
    ERROR: '-1',
    LOGIN_TIMEOUT: '-2',
    NO_PERMISSION: '-3'
  }

/**
 * $route GET api/users/test
 * @desc 返回的请求的 json 数据
 * @access public
 */
// Router.get() 方法来响应特定路径的 HTTP GET 请求
router.get("/test", (req, res) => {
    res.json({ msg: "login works" });
});

/**
 * $route POST api/users/register
 * @desc 返回的请求的 json 数据
 * @access public
 */
router.post("/register", (req, res) => {
    // console.log(req.body);

    // 查询数据库是否有邮箱
    User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            return res.status(400).json({ email: "邮箱已被注册！" });
        } else {
            var avatar = gravatar.url("req.body.email", { s: "200", r: "pg", d: "mm" });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar,
            });

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;

                    // Store hash in your password DB.
                    newUser
                        .save()
                        .then((user) => {
                            res.json(user);
                        })
                        .catch((err) => {
                            console.log("错误：", err);
                        });
                });
            });
        }
    });
});

/**
 * $route POST api/users/login
 * @desc 返回的请求的 json 数据
 * @access public
 */
router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // console.log(User)
    // 查询数据库
    User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(404).json({ msg: "用户不存在" });
        }

        // 密码匹配
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                const rule = { id: user.id, name: user.name, avatar: user.avatar };

                // jwt.sign("规则", "加密名字", "过期时间", "箭头函数");
                jwt.sign(rule, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    if (err) throw err;
                    res.json({
                        status: STATUS.SUCCESS,
                        data: {
                            name: user.name,
                            id: user.id
                        },
                        success: true,
                        token: "Bearer " + token,
                    });
                });
                // return res.json({ msg: "success" });
            } else {
                return res.status(404).json({ msg: "密码错误！" });
            }
        });
    });
});

/**
 * $route GET api/users/current
 * @desc return current user 验证 token
 * @access private
 */
router.get("/current", passpost.authenticate("jwt", { session: false }), (req, res) => {
    res.json({
        status: STATUS.SUCCESS,
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
    });
});

module.exports = router;
