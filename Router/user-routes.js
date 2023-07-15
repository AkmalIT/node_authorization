const {Router} = require('express')
const controller = require('../Controllers/user-controllers')
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../Middleware/auth-middleware');

router.post('/registration', body('email').isEmail(), body('password').isLength({min: 4, max:15}),controller.registration)
router.post('/login', controller.login)
router.post('logout', controller.logout)
router.get('/activate/:link', controller.activate)
router.get('/refresh', controller.refresh)
router.get('/users',authMiddleware, controller.getUsers)

module.exports = router