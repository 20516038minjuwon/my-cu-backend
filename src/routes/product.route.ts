import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validateParams, validateQuery } from "../middlewares/validation.middleware";
import { ProductIdParamSchema, ProductListQuerySchema } from "../schemas/product.schema";

const router = Router();
const productController = new ProductController();

router.get("/", validateQuery(ProductListQuerySchema), productController.getProducts);
router.get("/:id", validateParams(ProductIdParamSchema), productController.getProductById);

export default router;
