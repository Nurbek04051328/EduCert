const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, changeStatus, create, update, findOne, del, createAvatar, deleteAvatar } = require('../controllers/user');


router.get('/', auth,  all);

router.post("/", auth, create);

router.post("/avatar", auth, createAvatar);

router.post("/delavatar", auth, deleteAvatar);

router.get("/change/:id", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;