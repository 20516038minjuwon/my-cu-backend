import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { validateParams } from "../middlewares/validation.middleware";
import { CategoryIdParamSchema } from "../schemas/category.schema";

const router = Router();
const categoryController = new CategoryController();

router.get("/", categoryController.getCategories);
router.get("/:id", validateParams(CategoryIdParamSchema), categoryController.getCategoryById);

export default router;
