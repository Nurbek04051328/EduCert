const Router = require("express");
const router = new Router();
const auth = require('../../middleware/auth');
const {  create, update, adminPanelAll, findOne, del, all, allActive, changeStatus } = require('../../controllers/course/part');


router.get('/',   all);

router.post("/", create);

router.get('/all', auth,  adminPanelAll);
//
router.get('/active', auth,  allActive);
//
router.get("/change/:id", auth, changeStatus);
//
router.get("/:id", auth, findOne);
//
router.put('/', auth, update);
//
router.delete('/:id', auth,  del);




module.exports = router;