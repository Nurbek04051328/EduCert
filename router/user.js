const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { all, changeStatus, create, update, findOne, del } = require('../controllers/user');


router.get('/', auth,  all);

router.post("/", auth, create);

router.get("/change/:id", auth, changeStatus);

router.get("/:id", auth, findOne);

router.put('/', auth, update);

router.delete('/:id', auth,  del);




module.exports = router;