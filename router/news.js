const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, allActive, create, changeStatus, update, findOne, del, adminPanelAll, createPhoto, deleteImg } = require('../controllers/news');

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