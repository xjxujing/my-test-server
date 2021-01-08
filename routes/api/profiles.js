// @login & register
const express = require("express");
const router = express.Router();
const passpost = require("passport");

const Profile = require("../../models/Profile");

/**
 * $route GET api/profiles/test
 * @desc 返回的请求的 json 数据
 * @access public
 */
// Router.get() 方法来响应特定路径的 HTTP GET 请求
router.get("/test", (req, res) => {
    res.json({ msg: "profiles works" });
});

/**
 * $route POST api/profiles/add
 * @desc 创建朋友圈信息接口
 * @access private
 */
router.post("/add", passpost.authenticate("jwt", { session: false }), (req, res) => {
    const profilesFileds = {};
    if (req.body.img) profilesFileds.img = req.body.img;
    if (req.body.name) profilesFileds.name = req.body.name;
    if (req.body.text) profilesFileds.text = req.body.text;

    if (req.body.imgs) {
        profilesFileds.imgs = req.body.imgs.split("|");
    }

    new Profile(profilesFileds)
        .save()
        .then((profile) => {
            res.json(profile);
        })
        .catch((err) => {
            console.log(err);
        });
});

/**
 * $route GET api/profiles/latest
 * @desc 下拉刷新
 * @access private
 */
router.get("/latest", passpost.authenticate("jwt", { session: false }), (req, res) => {
    Profile.find()
        .sort({ date: -1 })
        .then((profiles) => {
            if (!profiles) {
                res.status(404).json("没有任何消息");
            } else {
                let newProfiles = [];
                for (let i = 0; i < 3; i++) {
                    if (profiles[i] != null) {
                        newProfiles.push(profiles[i]);
                    }
                }
                res.json(newProfiles);
            }
        })
        .catch(() =>{
            console.log(456)
        });
});

/**
 * $route GET api/profiles/:page/:size
 * @desc 上拉加载 10 条 下拉刷新请求 3 条，上拉加载请求 3 条
 * @access private
 */
router.get("/:page/:size", passpost.authenticate("jwt", { session: false }), (req, res) => {
    Profile.find()
        .sort({ date: -1 })
        .then((profiles) => {
            if (!profiles) {
                res.status(404).json("没有任何信息");
            } else {
                let size = req.params.size;
                let page = req.params.page;
                let index = size * (page - 1);
                let newProfiles = [];
                for (let i = index; i < size * page; i++) {
                    if (profiles[i] != null) {
                        newProfiles.unshift(profiles[i]);
                    }
                }
                res.json(newProfiles);
            }
        })
        .catch((err) => res.status(404).json(err));
});

module.exports = router;
