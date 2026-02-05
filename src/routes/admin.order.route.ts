import { Router } from "express";
import { AdminOrderController } from "../controllers/admin.order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateQuery, validateParams, validateBody } from "../middlewares/validation.middleware";
import {
    AdminOrderListQuerySchema,
    OrderIdParamSchema,
    AdminUpdateOrderSchema,
} from "../schemas/admin.order.schema";

const router = Router();
const controller = new AdminOrderController();

router.use(authenticateJwt, isAdmin);

router.get("/", validateQuery(AdminOrderListQuerySchema), controller.getOrders);
router.get("/:id", validateParams(OrderIdParamSchema), controller.getOrderById);
router.patch(
    "/:id/status",
    validateParams(OrderIdParamSchema),
    validateBody(AdminUpdateOrderSchema),
    controller.updateOrderStatus,
);

export default router;
