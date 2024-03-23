import {Router} from "express";
import productRouter from "./product.js"
import userRouter from "./user.js"
import userController from "../controllers/user.js"
import {auth} from "../middleware/auth.js"
import {emailConfirmation} from "../middleware/emailConfirmation.js"
import {validateLogin, validatePostUser, validatePasswordResetRequest, validateRestPasswordConfirmation} from "../middleware/validate.js"

const {login, logout, createUser, passwordResetRequest, restPasswordConfirmation} = userController;

const router = new Router();

router.post('/signup', validatePostUser, createUser)
router.get('/confirm/:token', emailConfirmation)
router.post('/reset-password', validatePasswordResetRequest, passwordResetRequest)
router.post('/reset-password/confirm', validateRestPasswordConfirmation, restPasswordConfirmation)
router.post('/signin', validateLogin, login)
router.get('/signout', logout)
router.use(auth)
router.use('/user', userRouter)
router.use('/product', productRouter)

export default router;