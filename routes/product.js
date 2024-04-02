import {Router} from "express";
import productController from "../controllers/product.js"
import { isAcces } from "../middleware/isAcces.js"
import {validatePostProduct, validatePatchProductInfo, validateId} from "../middleware/validate.js"
import { uploadImageMiddleware } from "../middleware/uploadImageMiddleware.js";
const {createProduct, deleteProduct, pathProductImage, pathProductInfo, deleteProductImage} = productController;
const router = new Router();

router.post('', isAcces('admin', 'moder'), uploadImageMiddleware, validatePostProduct, createProduct)
router.patch('/:id', isAcces('admin', 'moder'), validateId, validatePatchProductInfo, pathProductInfo)
router.patch('/image/:id', isAcces('admin', 'moder'), uploadImageMiddleware, validateId, pathProductImage)
router.delete('/image/:id', isAcces('admin', 'moder'), validateId, deleteProductImage)
router.delete('/:id', isAcces('admin', 'moder'), validateId, deleteProduct)

export default router;