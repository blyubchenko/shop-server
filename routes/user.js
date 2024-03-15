import { Router } from "express";
import userController from "../controllers/user.js";
import {isAdmin} from "../middleware/isAdmin.js";
const {
  getUserById,
  getUsers,
  getUserInfo,
  deleteAcount,
  deleteUser,
  updateUserData,
  updateRoleUser,
} = userController;
const router = new Router();

router.get("", isAdmin, getUsers);
router.get("/me", getUserInfo);
router.patch("/me", updateUserData);
router.delete("/me", deleteAcount);
router.get("/:id", isAdmin, getUserById);
router.delete("/:id", isAdmin, deleteUser);
router.patch("/:id", isAdmin, updateRoleUser);

export default router;
