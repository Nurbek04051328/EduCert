const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, allActive, create, changeStatus, update, findOne, del, adminPanelAll, createPhoto, deleteImg } = require('../controllers/category');

// Front
router.get('/',   all);


// AdminPanel
router.post("/", auth, create);

router.get('/all', auth,  adminPanelAll);

router.get('/active', auth,  allActive);

router.post("/icon", createPhoto);

router.post("/delicon", deleteImg);

router.get("/change/:id", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;