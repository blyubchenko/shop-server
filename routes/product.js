import {Router} from "express";
import productController from "../controllers/product.js"
const {getProducts, createProduct, deleteProduct, getProductById, updateProductData} = productController;
const router = new Router();

router.post('', createProduct)
router.get('', getProducts)
router.get('/:id', getProductById)
router.patch('/:id', updateProductData)
router.delete('/:id', deleteProduct)

export default router;