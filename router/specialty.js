const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, allActive, create, changeStatus, update, findOne, del, adminPanelAll} = require('../controllers/specialty');


router.get('/', auth,  all);

router.get('/all', auth,  adminPanelAll);

router.get('/active', auth,  allActive);

router.post("/", auth, create);

router.get("/change/:id", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;