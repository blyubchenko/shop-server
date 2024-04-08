import {Router} from "express";
import orderController from "../controllers/order.js"
import { isAcces } from "../middleware/isAcces.js"
import { validateId, validateUpdateOrder } from "../middleware/validate.js"

const {createOrder, deleteOrder, updateOrder, getAllOrders, getOrderById} = orderController;
const router = new Router();

router.get('', getAllOrders)
router.get('/:id', validateId, getOrderById)
router.post('', createOrder)
router.patch('/:id', isAcces('admin', 'moder'), validateId, validateUpdateOrder, updateOrder)
router.delete('/:id', isAcces('admin', 'moder'), validateId, deleteOrder)

export default router;