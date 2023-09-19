const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { addadmin, login, checkUser, checkLogin, getUser } = require("../controllers/auth");



router.get('/login/addadmin', addadmin);

router.get('/checkuser',auth, checkUser);

router.post('/checklogin',auth, checkLogin);

router.post('/login', login);

router.get('/getuser', auth, getUser);


module.exports = router;