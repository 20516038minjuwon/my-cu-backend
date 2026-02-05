import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import {
    CreateOrderSchema,
    ConfirmPaymentSchema,
    OrderParamSchema,
    UpdateOrderStatusSchema,
} from "../schemas/order.schema";
import { PaginationQuerySchema } from "../schemas/common.schema";

const router = Router();
const orderController = new OrderController();

// 모든 주문 기능은 로그인 필요
router.use(authenticateJwt);

// 1. 주문 생성 & 결제 승인
router.post("/", validateBody(CreateOrderSchema), orderController.createOrder);
router.post("/confirm", validateBody(ConfirmPaymentSchema), orderController.confirmPayment);

// 2. 조회 (목록, 상세)
router.get("/", validateQuery(PaginationQuerySchema), orderController.getOrders);
router.get("/:id", validateParams(OrderParamSchema), orderController.getOrderById);

// 3. 상태 변경 (취소, 반품)
router.patch(
    "/:id/status",
    validateParams(OrderParamSchema),
    validateBody(UpdateOrderStatusSchema),
    orderController.updateOrderStatus,
);

export default router;
