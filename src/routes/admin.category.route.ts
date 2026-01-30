import { Router } from "express";
import { AdminCategoryController } from "../controllers/admin.category.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import {
    CreateCategorySchema,
    UpdateCategorySchema,
    CategoryIdParamSchema,
} from "../schemas/admin.category.schema";

const router = Router();
const adminCategoryController = new AdminCategoryController();

// 모든 관리자 라우트에 인증 및 권한 검사 적용
router.use(authenticateJwt, isAdmin);

router.post("/", validateBody(CreateCategorySchema), adminCategoryController.createCategory);
router.put(
    "/:id",
    validateParams(CategoryIdParamSchema),
    validateBody(UpdateCategorySchema),
    adminCategoryController.updateCategory,
);
router.delete(
    "/:id",
    validateParams(CategoryIdParamSchema),
    adminCategoryController.deleteCategory,
);

export default router;
