const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { adminPanelAll, all, create, update, findOne, changeStatus, allActive, del, createPhoto, deleteImg } = require('../controllers/page');

// Front
router.get('/',   all);


// AdminPanel
router.post("/", auth, create);

router.get('/all', auth,  adminPanelAll);

router.get('/active', auth,  allActive);

router.post("/img", createPhoto);

router.post("/delimg", deleteImg);

router.get("/change/:id", auth, changeStatus);

router.get("/:id",  findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;