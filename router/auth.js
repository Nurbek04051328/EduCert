const Router = require("express");
const router = new Router();
const auth = require('../middleware/auth');
const { addadmin, reg, login, checkUser, checkLogin, getUser, del } = require("../controllers/auth");



router.get('/login/addadmin', addadmin);

router.get('/checkuser',auth, checkUser);

router.post('/checklogin',auth, checkLogin);

router.post('/reg', reg);

router.post('/login', login);

router.get('/getuser', auth, getUser);

router.delete('/deluser/:id', auth, del);


module.exports = router;