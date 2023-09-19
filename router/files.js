const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { createImg, deleteFile } = require('../controllers/files');


router.post("/img", auth, createImg);

router.post("/del", auth, deleteFile);





module.exports = router;