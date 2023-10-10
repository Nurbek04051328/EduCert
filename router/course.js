const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const {  allActive, create, changeStatus, update, findOne, del, adminPanelAll, createImg, deleteImg } = require('../controllers/course');


// router.get('/',   all);

router.post("/", create);

router.get('/all', auth,  adminPanelAll);

router.get('/active', auth,  allActive);

router.post("/img", createImg);

router.post("/delimg", deleteImg);


router.get("/change/:id", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;