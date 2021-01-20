// @login & register
const express = require("express");
const router = express.Router();
const passpost = require("passport");

const Profile = require("../../models/Profile");

const STATUS = {
    SUCCESS: '0',
    ERROR: '-1',
    LOGIN_TIMEOUT: '-2',
    NO_PERMISSION: '-3'
  }
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
    const profilesFields = {};
    
    if (req.body.avatar) profilesFields.avatar = req.body.avatar;
    if (req.body.name) profilesFields.name = req.body.name;
    if (req.body.text) profilesFields.text = req.body.text;
    if (req.body.age) profilesFields.age = req.body.age;
    if (req.body.gender) profilesFields.gender = req.body.gender;
    if (req.body.isVisible) profilesFields.isVisible = req.body.isVisible;
    if (req.body.imgs) {
        profilesFields.imgs = req.body.imgs.split(",");
    }

    new Profile(profilesFields)
        .save()
        .then((profile) => {
            res.json(profile);
        })
        .catch((err) => {
            console.log(err);
        });
});

/**
 * $route GET api/profiles/list
 * @desc 下拉刷新
 * @access private
 */
router.get("/list2333", passpost.authenticate("jwt", { session: false }), (req, res) => {
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
                res.json({
                    status: STATUS.SUCCESS,
                    data: newProfiles,
                });
            }
        })
        .catch(() =>{
            console.log(456)
        });
});

/**
 * $route POST /api/profiles/list
 * @desc 
 * @access private
 */
router.post("/list", passpost.authenticate("jwt", { session: false }), (req, res) => {
    console.log(req.body)
    Profile.find()
        .sort({ date: -1 })
        .then((profiles) => {
            if (!profiles) {
                res.status(404).json("没有任何信息");
            } else {
                let size = req.body.pageSize;
                let page = req.body.page;
                let index = size * (page - 1);
                let newProfiles = [];
                for (let i = index; i < size * page; i++) {
                    if (profiles[i] != null) {
                        newProfiles.unshift(profiles[i]);
                    }
                }
                res.json(
                    {
                        status: STATUS.SUCCESS,
                        data: newProfiles,
                        page: page,
                        pageSize: size,
                        count: profiles.length
                    }
                );
            }
        })
        .catch((err) => res.status(404).json(err));
});

module.exports = router;
