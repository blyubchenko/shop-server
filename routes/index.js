import {Router} from "express";
import productRouter from "./product.js"
import userRouter from "./user.js"
import userController from "../controllers/user.js"

const {login, logout, createUser} = userController;

const router = new Router();

router.post('/signup', createUser)
router.post('/signin',  login)
router.get('/signout',  logout)
router.use('/user', userRouter)
router.use('/product', productRouter)

export default router;