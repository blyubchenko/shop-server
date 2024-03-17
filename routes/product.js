import {Router} from "express";
import productController from "../controllers/product.js"
import { isAcces } from "../middleware/isAcces.js"
import {validatePostProduct, validatePatchProductInfo, validateId} from "../middleware/validate.js"
const {getProducts, createProduct, deleteProduct, getProductById, updateProductData} = productController;
const router = new Router();

router.post('', isAcces('admin', 'moder'), validatePostProduct, createProduct)
router.get('', getProducts)
router.get('/:id', validateId, getProductById)
router.patch('/:id', isAcces('admin', 'moder'), validateId, validatePatchProductInfo, updateProductData)
router.delete('/:id', isAcces('admin', 'moder'), validateId, deleteProduct)

export default router;