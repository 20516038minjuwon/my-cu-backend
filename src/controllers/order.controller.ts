import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { PaginationQuery } from "../schemas/common.schema";
import {
    CreateOrderInput,
    ConfirmPaymentInput,
    UpdateOrderStatusInput,
} from "../schemas/order.schema";

const orderService = new OrderService();

export class OrderController {
    async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const body = req.body as CreateOrderInput;

            const order = await orderService.createOrder(userId, body);
            res.status(201).json({
                message: "주문서가 생성되었습니다. 결제를 진행해주세요.",
                data: order,
            });
        } catch (error) {
            next(error);
        }
    }

    async confirmPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const body = req.body as ConfirmPaymentInput;

            const result = await orderService.confirmPayment(userId, body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const query = req.query as unknown as PaginationQuery;

            const result = await orderService.getOrders(userId, query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const params = req.params as unknown as { id: string };
            const orderId = Number(params.id);

            const result = await orderService.getOrderById(userId, orderId);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const params = req.params as unknown as { id: string };
            const orderId = Number(params.id);
            const body = req.body as UpdateOrderStatusInput;

            const result = await orderService.updateOrderStatus(userId, orderId, body);
            res.status(200).json({ message: "상태가 변경되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    }
}
