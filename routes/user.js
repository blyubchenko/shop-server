import { Router } from "express";
import userController from "../controllers/user.js";
import {isAdmin} from "../middleware/isAdmin.js";
import {validatePatchUserInfo, validatePatchUserRole, validateId} from "../middleware/validate.js"
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
router.patch("/me", validatePatchUserInfo, updateUserData);
router.delete("/me", deleteAcount);
router.get("/:id", validateId, isAdmin, getUserById);
router.delete("/:id", isAdmin, validateId, deleteUser);
router.patch("/:id", isAdmin, validateId, validatePatchUserRole, updateRoleUser);

export default router;
