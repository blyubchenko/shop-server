import {Router} from "express";
import productController from "../controllers/product.js"
import { isAdmin } from "../middleware/isAdmin.js";
const {getProducts, createProduct, deleteProduct, getProductById, updateProductData} = productController;
const router = new Router();

router.post('', isAdmin, createProduct)
router.get('', getProducts)
router.get('/:id', getProductById)
router.patch('/:id', isAdmin, updateProductData)
router.delete('/:id', isAdmin, deleteProduct)

export default router;