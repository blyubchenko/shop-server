import { Router } from "express";
import productRouter from "./product.js";
import cartRoutes from "./cart.js";
import userRouter from "./user.js";
import userController from "../controllers/user.js";
import { auth } from "../middleware/auth.js";
import productController from "../controllers/product.js";
const { getProducts, getProductById } = productController;
import { emailConfirmation } from "../middleware/emailConfirmation.js";
import {
  validateLogin,
  validateId,
  validateGetProducts,
  validatePostUser,
  validatePasswordResetRequest,
  validateRestPasswordConfirmation,
} from "../middleware/validate.js";

const {
  login,
  logout,
  createUser,
  passwordResetRequest,
  restPasswordConfirmation,
} = userController;

const router = new Router();

router.post("/signup", validatePostUser, createUser);
router.get("/confirm/:token", emailConfirmation);
router.post(
  "/reset-password",
  validatePasswordResetRequest,
  passwordResetRequest
);
router.post(
  "/reset-password/confirm",
  validateRestPasswordConfirmation,
  restPasswordConfirmation
);
router.post("/signin", validateLogin, login);
router.get("/signout", logout);
router.use("/cart", cartRoutes);
router.get("/product", validateGetProducts, getProducts);
router.get("/product/:id", validateId, getProductById);
router.use(auth);
router.use("/user", userRouter);
router.use("/product", productRouter);

export default router;
