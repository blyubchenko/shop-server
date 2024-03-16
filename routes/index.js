import {Router} from "express";
import productRouter from "./product.js"
import userRouter from "./user.js"
import userController from "../controllers/user.js"
import {auth} from "../middleware/auth.js"
import {validateLogin, validatePostUser} from "../middleware/validate.js"

const {login, logout, createUser} = userController;

const router = new Router();

router.post('/signup', validatePostUser, createUser)
router.post('/signin', validateLogin, login)
router.get('/signout', logout)
router.use(auth)
router.use('/user', userRouter)
router.use('/product', productRouter)

export default router;