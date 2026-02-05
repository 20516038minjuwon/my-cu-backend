import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { AddToCartSchema, UpdateCartItemSchema, CartItemParamSchema } from "../schemas/cart.schema";

const router = Router();
const cartController = new CartController();

router.use(authenticateJwt);

router.get("/", cartController.getCart);
router.post("/items", validateBody(AddToCartSchema), cartController.addToCart);
router.patch(
    "/items/:itemId",
    validateParams(CartItemParamSchema),
    validateBody(UpdateCartItemSchema),
    cartController.updateCartItem,
);
router.delete("/items/:itemId", validateParams(CartItemParamSchema), cartController.removeCartItem);

export default router;
