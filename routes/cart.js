import {Router} from "express";
import cartController from "../controllers/cart.js"
import {validateId, validateUpdateQuantityProductInCart} from '../middleware/validate.js'
const {getProductsInCart, addToCart, deleteProductFromCart, updateQuantityProductInCart, emptyСart} = cartController;
const router = new Router();

router.get('', getProductsInCart)
router.delete('', emptyСart)
router.post('/:id', validateId, addToCart)
router.put('/:id', validateId, validateUpdateQuantityProductInCart, updateQuantityProductInCart)
router.delete('/:id', validateId, deleteProductFromCart)

export default router;