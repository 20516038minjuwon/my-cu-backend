import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import { isAdmin } from "../middlewares/admin.middleware";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import {
    CreateUserSchema,
    PaginationQuerySchema,
    UpdateUserSchema,
    UserIdParamSchema,
} from "../schemas/admin.user.schema";

const router = Router();
const adminUserController = new AdminUserController();

router.use(authenticateJwt, isAdmin);

router.get("/", validateQuery(PaginationQuerySchema), adminUserController.getUsers);
router.get("/:id", validateParams(UserIdParamSchema), adminUserController.getUser);
router.post("/", validateBody(CreateUserSchema), adminUserController.createUser);
router.put(
    "/:id",
    validateParams(UserIdParamSchema),
    validateBody(UpdateUserSchema),
    adminUserController.updateUser,
);
router.delete("/:id", validateParams(UserIdParamSchema), adminUserController.deleteUser);

export default router;
