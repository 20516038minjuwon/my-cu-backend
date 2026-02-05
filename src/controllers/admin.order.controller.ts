import { Request, Response, NextFunction } from "express";
import { AdminOrderService } from "../services/admin.order.service";
import { AdminOrderListQuery, AdminUpdateOrderInput } from "../schemas/admin.order.schema";

const adminOrderService = new AdminOrderService();

export class AdminOrderController {
    async getOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as unknown as AdminOrderListQuery;
            const result = await adminOrderService.getOrders(query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await adminOrderService.getOrderById(id);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as AdminUpdateOrderInput;

            const result = await adminOrderService.updateOrderStatus(id, body);
            res.status(200).json({ message: "주문 상태가 변경되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    }
}
