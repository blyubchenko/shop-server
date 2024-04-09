import { Router } from "express";
import userController from "../controllers/user.js";
import {isAcces} from "../middleware/isAcces.js";
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

router.get("", isAcces('admin', 'moder'), getUsers);
router.get("/me", getUserInfo);
router.patch("/me", validatePatchUserInfo, updateUserData);
router.delete("/me", deleteAcount);
router.get("/:id", isAcces('admin', 'moder'), validateId, getUserById);
router.delete("/:id", isAcces('admin'), validateId, deleteUser);
router.patch("/:id", isAcces('admin', 'moder'), validateId, validatePatchUserRole, updateRoleUser);

export default router;
