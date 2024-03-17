import {Router} from "express";
import productController from "../controllers/product.js"
import { isAcces } from "../middleware/isAcces.js"
import {validatePostProduct, validatePatchProductInfo, validateId} from "../middleware/validate.js"
const {getProducts, createProduct, deleteProduct, getProductById, updateProductData} = productController;
const router = new Router();

router.post('', isAcces, validatePostProduct, createProduct)
router.get('', getProducts)
router.get('/:id', validateId, getProductById)
router.patch('/:id', isAcces, validateId, validatePatchProductInfo, updateProductData)
router.delete('/:id', isAcces, validateId, deleteProduct)

export default router;