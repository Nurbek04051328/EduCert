const Router = require("express");
const router = new Router();
const auth = require('../../middleware/auth');
const { all, allActive, create, changeStatus, update, findOne, del, adminPanelAll, byCat, forRates } = require('../../controllers/course/course');


router.get('/',   all);

router.post("/", create);

router.post("/rate", forRates);

router.get("/bycat/:id", byCat);

router.get('/all', auth,  adminPanelAll);

router.get('/active', auth,  allActive);

router.get("/change/:id", auth, changeStatus);

router.get("/:id", findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;