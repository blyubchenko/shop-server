import {Router} from "express";
import productController from "../controllers/product.js"
import { isAcces } from "../middleware/isAcces.js"
import {validatePostProduct, validatePatchProductInfo, validateId} from "../middleware/validate.js"
import { uploadMediaMiddleware } from "../middleware/uploadMediaMiddleware.js";
const {createProduct, deleteProduct, patchProductImage, patchProductInfo, deleteProductImage, patchProductVideo, deleteProductVideo} = productController;
const router = new Router();

router.post('', isAcces('admin', 'moder'), uploadMediaMiddleware, validatePostProduct, createProduct)
router.patch('/:id', isAcces('admin', 'moder'), validateId, validatePatchProductInfo, patchProductInfo)
router.patch('/image/:id', isAcces('admin', 'moder'), uploadMediaMiddleware, validateId, patchProductImage)
router.patch('/video/:id', isAcces('admin', 'moder'), uploadMediaMiddleware, validateId, patchProductVideo)
router.delete('/image/:id', isAcces('admin', 'moder'), validateId, deleteProductImage)
router.delete('/video/:id', isAcces('admin', 'moder'), validateId, deleteProductVideo)
router.delete('/:id', isAcces('admin', 'moder'), validateId, deleteProduct)

export default router;