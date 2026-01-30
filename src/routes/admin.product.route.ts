import { Router } from "express";
import { AdminProductController } from "../controllers/admin.product.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import {
    CreateProductSchema,
    UpdateProductSchema,
    ProductIdParamSchema,
} from "../schemas/admin.product.schema";

const router = Router();
const adminProductController = new AdminProductController();

router.use(authenticateJwt, isAdmin);

router.post("/", validateBody(CreateProductSchema), adminProductController.createProduct);
router.put(
    "/:id",
    validateParams(ProductIdParamSchema),
    validateBody(UpdateProductSchema),
    adminProductController.updateProduct,
);
router.delete("/:id", validateParams(ProductIdParamSchema), adminProductController.deleteProduct);

export default router;
