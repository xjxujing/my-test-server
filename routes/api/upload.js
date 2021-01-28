
const multer = require("multer")
const upload = multer({ dest: "uploads/" })
const express = require("express");
const router = express.Router();
const Files = require("../../models/Files");
const STATUS_CODE = require("../../config/statusCode");


router.get("/test", (req, res) => {
    res.json({ msg: "upload works" });
});

/**
 * 上传图片
 * $route POST api/upload
 * /api/upload
 */
router.post("/upload", upload.single("image"), (req, res) => {
    const { filename, originalname, path, size } = req.file
    const fileInfo = { filename, originalname, path, size }
    fileInfo.dirId = req.body.dirId
    fileInfo.fileType = req.body.type

    new Files(fileInfo).save().then((file) => {
        res.send({ data: { filename, originalname, path }, status: STATUS_CODE.SUCCESS })
    })
})

router.get("/preview/:key", (req, res) => {
    console.log(req.params.key)
    res.sendFile(
        `uploads/${req.params.key}`,
        {
            root: __dirname,
            headers: {
                "Content-Type": "image/*"
            },
        },
        error => {
            console.log(error)
        })
})


module.exports = router;
