import { Router } from "express";
import userController from "../controllers/user.js";
const {
  getUserById,
  getUsers,
  getUserInfo,
  deleteAcount,
  deleteUser,
  updateUserData,
} = userController;
const router = new Router();

router.get("", getUsers);
router.get("/me", getUserInfo);
router.patch("/me", updateUserData);
router.delete("/me", deleteAcount);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
