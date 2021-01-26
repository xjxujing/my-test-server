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
 * $route POST api/profiles/find
 * @desc 查
 * @access private
 */
router.post("/find", passpost.authenticate("jwt", { session: false }), (req, res) => {
    const id = req.body.id
    Profile.findById(id, (err, profile) => {
        if (!err && profile) {
            res.json({
                status: STATUS.SUCCESS,
                data: profile
            })
        }
        if (!profile) {
            res.json({ status: STATUS.ERROR, msg: '没有找到数据' })
            return
        }
        if (err) {
            res.json({ status: STATUS.ERROR, err: err })
        }

    })
});


/**
 * $route POST api/profiles/add
 * @desc 添加
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
            res.json({
                data: profile,
                status: STATUS.SUCCESS
            });
        })
        .catch((err) => {
            console.log(err);
        });
});



/**
 * $route POST api/profiles/update
 * @desc 修改
 * @access private
 */
router.post("/update", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    const id = req.body._id
    Profile.findByIdAndUpdate(id, { ...req.body }, (err, profile) => {
        if (!err && profile) {
            res.json({
                status: STATUS.SUCCESS,
                data: profile
            })
        } else {
            res.json({
                status: STATUS.ERROR,
                err: err
            })
        }
    })

});


/**
 * $route POST api/profiles/delete
 * @desc 添加
 * @access private
 */
router.post("/delete", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    const id = req.body._id

    Profile.findByIdAndRemove(id, (err, profile) => {
        // console.log('profile: ', {err, profile})
        if (!profile) {
            res.json({
                status: STATUS.ERROR,
                msg: '不存在该项'
            })
        } else {
            res.json({
                status: STATUS.SUCCESS,
                msg: '删除成功'
            })
        }
    })

});

/**
 * $route POST api/profiles/batchDelete
 * @desc 批量删除
 * @access private
 */
router.post("/batchDelete", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    const ids = req.body.ids

    const idsArray = ids.split(',')
    Profile.deleteMany({
        _id: {
            $in: [...idsArray]
        }
    }, (err, result) => {
        if (err) {
            res.json({
                status: STATUS.ERROR,
                err: err
            });
        } else {
            res.json({
                status: STATUS.SUCCESS,
                msg: '删除成功！'
            })
        }
    })

});

/**
 * $route GET api/profiles/onlyThree
 * @desc 只有3条
 * @access private
 */
router.get("/onlyThree", passpost.authenticate("jwt", { session: false }), (req, res) => {
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
        .catch(() => {
            console.log(456)
        });
});

/**
 * $route POST /api/profiles/list
 * @desc 
 * @access private
 */
router.post("/list", (req, res, next) => {
    passpost.authenticate("jwt", { session: false }, (err, user, info) => {
        // console.log({ err, user, info })
        if (err) {
            res.json({ msg: '出现错误' })
            return
        }
        if (!user) {
            res.json({ status: STATUS.NO_PERMISSION, msg: '没有访问权限' })
            return
        }
        fetchProfiledData(req, res)

    })(req, res, next);
});

function fetchProfiledData(req, res) {
    console.log(req.body)

    const findData = {
        name: req.body.s_name ?  {$regex: `${req.body.s_name}`} : {$regex: ''}
    }

    Profile.find(findData)
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
                        newProfiles.push(profiles[i]);
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

}

module.exports = router;
