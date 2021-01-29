// @login & register
const express = require("express");
const router = express.Router();
const passpost = require("passport");
const Dirs = require("../../models/Dirs");
const STATUS_CODE = require("../../config/statusCode");


/**
 * $route GET api/dirs/test
 * @desc 返回的请求的 json 数据
 * @access public
 */
// Router.get() 方法来响应特定路径的 HTTP GET 请求
router.get("/test", (req, res) => {
    res.json({ msg: "dirs works" });
});

/**
 * $route POST api/dirs/find
 * @desc 查
 * @access private
 */
router.post("/find", passpost.authenticate("jwt", { session: false }), (req, res) => {
    const id = req.body.id
    Dirs.findById(id, (err, profile) => {
        if (!err && profile) {
            res.json({
                status: STATUS_CODE.SUCCESS,
                data: profile
            })
        }
        if (!profile) {
            res.json({ status: STATUS_CODE.ERROR, msg: '没有找到数据' })
            return
        }
        if (err) {
            res.json({ status: STATUS_CODE.ERROR, err: err })
        }

    })
});


/**
 * $route POST api/dirs/add
 * @desc 添加文件夹
 * @access private
 */
router.post("/add", passpost.authenticate("jwt", { session: false }), (req, res) => {
    const dirsFields = {};

    if (req.body.parentId) dirsFields.parentId = req.body.parentId;
    if (req.body.name) dirsFields.name = req.body.name;

    new Dirs(dirsFields)
        .save()
        .then((dir) => {
            res.json({
                data: dir,
                status: STATUS_CODE.SUCCESS
            });
        })
        .catch((err) => {
            console.log(err);
        });
});



/**
 * $route POST api/dirs/update
 * @desc 修改
 * @access private
 */
router.post("/update", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    const id = req.body._id
    Dirs.findByIdAndUpdate(id, { ...req.body }, (err, profile) => {
        if (!err && profile) {
            res.json({
                status: STATUS_CODE.SUCCESS,
                data: profile
            })
        } else {
            res.json({
                status: STATUS_CODE.ERROR,
                err: err
            })
        }
    })

});


/**
 * $route POST api/dirs/delete
 * @desc 添加
 * @access private
 */
router.post("/delete", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    const id = req.body._id

    Dirs.findByIdAndRemove(id, (err, profile) => {
        // console.log('profile: ', {err, profile})
        if (!profile) {
            res.json({
                status: STATUS_CODE.ERROR,
                msg: '不存在该项'
            })
        } else {
            res.json({
                status: STATUS_CODE.SUCCESS,
                msg: '删除成功'
            })
        }
    })

});

/**
 * $route POST api/dirs/batchDelete
 * @desc 批量删除
 * @access private
 */
router.post("/batchDelete", passpost.authenticate("jwt", { session: false }), async (req, res) => {
    const ids = req.body.ids

    const idsArray = ids.split(',')
    Dirs.deleteMany({
        _id: {
            $in: [...idsArray]
        }
    }, (err, result) => {
        if (err) {
            res.json({
                status: STATUS_CODE.ERROR,
                err: err
            });
        } else {
            res.json({
                status: STATUS_CODE.SUCCESS,
                msg: '删除成功！'
            })
        }
    })

});


/**
 * $route POST /api/dirs/list
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
            res.json({ status: STATUS_CODE.NO_PERMISSION, msg: '没有访问权限' })
            return
        }
        fetchDirsData(req, res)

    })(req, res, next);
});

async function fetchDirsData(req, res) {
    const newDirs = []
    const dirs = await Dirs.find()
    for (const dir of dirs) {
        newDirs.push(dir.toJSON())
    }
    
    const dirsData = convert(newDirs)
    res.json({
        data: dirsData,
        status: STATUS_CODE.SUCCESS,
    })
}



function convert(list) {
    const res = []
    const map = list.reduce((res, v) => (res[v._id] = v, res), {})

    for (const item of list) {
        if (!item.parentId) {
            res.push(item)
            continue
        }
        if (item.parentId in map) {
            // console.log('456456', Boolean(item.parentId in map), item.parentId)

            const parent = map[item.parentId]
            // console.log('parent', {parent, res})
            parent.children = parent.children || []
            parent.children.push(item)
        }
    }
    return res
}

function getRoots(dirs) {
    let roots = [];
    for (let i = 0; i < dirs.length; i++) {
        if (!dirs[i].parentId) {
            // roots.push(JSON.parse(JSON.stringify(dirs[i])));
            roots.push(dirs[i]);

        }
    }

    return roots
}

module.exports = router;
