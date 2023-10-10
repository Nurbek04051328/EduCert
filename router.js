const {Router} = require('express');
const router = Router();


router.use('/auth', require("./router/auth"));
// router.use('/files', require("./router/files"));
router.use('/user', require("./router/user"));
router.use('/category', require("./router/category"));
router.use('/specialty', require("./router/specialty"));
router.use('/mentor', require("./router/mentor"));
router.use('/degree', require("./router/degree"));
router.use('/lesson', require("./router/lesson"));
router.use('/news', require("./router/news"));
router.use('/course', require("./router/course"));




module.exports = router