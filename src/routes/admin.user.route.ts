import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import { isAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware"; // 이전에 만든 미들웨어 사용

const router = Router();
const adminUserController = new AdminUserController();

router.use(authenticateJwt, isAdmin);

router.get("/users", adminUserController.getUsers);
router.get("/users/:id", adminUserController.getUser);
router.post("/users", adminUserController.createUser);
router.put("/users/:id", adminUserController.updateUser);
router.delete("/users/:id", adminUserController.deleteUser);

export default router;
