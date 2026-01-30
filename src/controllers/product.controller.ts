import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
    async getProducts(req: Request, res: Response, next: NextFunction) {
        try {
            // [중요] Express Query 파라미터 명시적 형변환
            // req.query.page가 있으면 Number로, 없으면 기본값 1
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            // Optional 숫자 필드
            const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

            // Optional 불리언 필드 (String "true" 인지 확인)
            // Zod 미들웨어를 통과했으므로 값은 안전하지만 타입은 string일 수 있음
            const isNew = req.query.isNew !== undefined ? String(req.query.isNew) === "true" : undefined;
            const isBest = req.query.isBest !== undefined ? String(req.query.isBest) === "true" : undefined;

            // String 필드
            const keyword = req.query.keyword ? String(req.query.keyword) : undefined;
            const sort = req.query.sort ? String(req.query.sort) as "latest" | "lowPrice" | "highPrice" : undefined;

            const result = await productService.getProducts({
                page,
                limit,
                categoryId,
                isNew,
                isBest,
                keyword,
                sort,
            });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            // [중요] Express Params 명시적 형변환
            const id = Number(req.params.id);

            const product = await productService.getProductById(id);
            res.status(200).json({ data: product });
        } catch (error) {
            next(error);
        }
    }
}