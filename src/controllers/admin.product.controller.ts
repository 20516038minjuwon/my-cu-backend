import { Request, Response, NextFunction } from "express";
import { AdminProductService } from "../services/admin.product.service";

const adminProductService = new AdminProductService();

export class AdminProductController {
    async createProduct(req: Request, res: Response, next: NextFunction) {
        try {
            // Body는 Zod 검증을 통과했으므로 안전하게 전달
            const product = await adminProductService.createProduct(req.body);

            res.status(201).json({
                message: "상품이 성공적으로 등록되었습니다.",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            // [형변환] params.id를 Number로 변환
            const id = Number(req.params.id);

            const product = await adminProductService.updateProduct(id, req.body);

            res.status(200).json({
                message: "상품 정보가 수정되었습니다.",
                data: product,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            // [형변환] params.id를 Number로 변환
            const id = Number(req.params.id);

            const result = await adminProductService.deleteProduct(id);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
