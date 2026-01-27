import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { UpdateProfileSchema, ChangePasswordSchema } from "../schemas/user.schema";

const router = Router();
const userController = new UserController();

router.use(authenticateJwt);

router.get("/me", userController.getMe);
router.put("/me", validateBody(UpdateProfileSchema), userController.updateProfile);
router.put("/me/password", validateBody(ChangePasswordSchema), userController.changePassword);

export default router;
