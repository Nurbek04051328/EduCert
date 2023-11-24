const {Router} = require('express');
const router = Router();


router.use('/auth', require("./router/auth"));
router.use('/files', require("./router/files"));
router.use('/user', require("./router/user"));
router.use('/category', require("./router/category"));
router.use('/specialty', require("./router/specialty"));
router.use('/mentor', require("./router/mentor"));
router.use('/degree', require("./router/degree"));
router.use('/lesson', require("./router/course/lesson"));
router.use('/news', require("./router/news"));
router.use('/course', require("./router/course/course"));
router.use('/part', require("./router/course/part"));
router.use('/chapter', require("./router/course/chapter"));
router.use('/page', require("./router/page"));
router.use('/test', require("./router/course/test"));
router.use('/qa', require("./router/course/qa"));




module.exports = router