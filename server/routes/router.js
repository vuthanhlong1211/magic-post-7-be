const Router = require('express');
const authRoute = require('./auth');
const dashboardRoute = require('./dashboard');
const signupRoute = require('./signup');
const roomRoute = require('./room');

const router = Router();

router.get('/', (req, res) => {
    res.redirect('/login');
});

router.use('/login', authRoute);
router.use('/signup', signupRoute);
router.use('/dashboard', dashboardRoute);
router.use('/roomlist', roomRoute);


module.exports = router;