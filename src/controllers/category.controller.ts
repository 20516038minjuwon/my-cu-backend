import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { CategoryIdParam } from "../schemas/category.schema";

const categoryService = new CategoryService();

export class CategoryController {
    async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getCategories();
            res.status(200).json({ data: categories });
        } catch (error) {
            next(error);
        }
    }

    async getCategoryById(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as CategoryIdParam;
            const id = Number(params.id);

            const category = await categoryService.getCategoryById(id);
            res.status(200).json({ data: category });
        } catch (error) {
            next(error);
        }
    }
}
