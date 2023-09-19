const {Router} = require('express');
const router = Router();


router.use('/auth', require("./router/auth"));
router.use('/files', require("./router/files"));
router.use('/user', require("./router/user"));
router.use('/category', require("./router/category"));




module.exports = router