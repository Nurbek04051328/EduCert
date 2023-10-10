const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, adminPanelAll, allActive, create, changeStatus, update, findOne, del, createPhoto, deleteImg } = require('../controllers/mentor');


router.get('/', all);

router.get('/all', auth,  adminPanelAll);

router.get('/active', auth,  allActive);

router.post("/", auth, create);

router.post("/avatar", createPhoto);

router.post("/delavatar", deleteImg);

router.get("/change/:id", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;