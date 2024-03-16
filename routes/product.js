import {Router} from "express";
import productController from "../controllers/product.js"
import { isAdmin } from "../middleware/isAdmin.js";
import {validatePostProduct, validatePatchProductInfo, validateId} from "../middleware/validate.js"
const {getProducts, createProduct, deleteProduct, getProductById, updateProductData} = productController;
const router = new Router();

router.post('', isAdmin, validatePostProduct, createProduct)
router.get('', getProducts)
router.get('/:id', validateId, getProductById)
router.patch('/:id', isAdmin, validateId, validatePatchProductInfo, updateProductData)
router.delete('/:id', isAdmin, validateId, deleteProduct)

export default router;