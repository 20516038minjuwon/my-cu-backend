import { Request, Response, NextFunction } from "express";
import { AdminCategoryService } from "../services/admin.category.service";

const adminCategoryService = new AdminCategoryService();

export class AdminCategoryController {
    async createCategory(req: Request, res: Response, next: NextFunction) {
        try {
            // Body는 JSON 파서에 의해 타입이 유지되지만, 안전을 위해 필요한 경우 형변환 가능
            // 여기서는 Zod가 검증했으므로 req.body 그대로 전달
            const category = await adminCategoryService.createCategory(req.body);
            res.status(201).json({ message: "카테고리 생성 성공", data: category });
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(req: Request, res: Response, next: NextFunction) {
        try {
            // [중요] Express Params는 String이므로 Number로 변환
            const id = Number(req.params.id);

            const category = await adminCategoryService.updateCategory(id, req.body);
            res.status(200).json({ message: "카테고리 수정 성공", data: category });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req: Request, res: Response, next: NextFunction) {
        try {
            // [중요] Express Params는 String이므로 Number로 변환
            const id = Number(req.params.id);

            const result = await adminCategoryService.deleteCategory(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}