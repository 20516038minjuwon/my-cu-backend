import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { Prisma } from "@prisma/client";

interface GetProductsParams {
    page: number;
    limit: number;
    categoryId?: number;
    isNew?: boolean;
    isBest?: boolean;
    keyword?: string;
    sort?: "latest" | "lowPrice" | "highPrice";
}

export class ProductService {
    async getProducts(params: GetProductsParams) {
        const { page, limit, categoryId, isNew, isBest, keyword, sort } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.ProductWhereInput = {};

        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (typeof isNew === "boolean") {
            where.isNew = isNew;
        }
        if (typeof isBest === "boolean") {
            where.isBest = isBest;
        }
        if (keyword) {
            where.name = { contains: keyword }; // 부분 일치 검색
        }

        let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

        if (sort === "lowPrice") {
            orderBy = { price: "asc" };
        } else if (sort === "highPrice") {
            orderBy = { price: "desc" };
        }

        const [total, products] = await prisma.$transaction([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: { select: { name: true } },
                },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: products,
            pagination: {
                totalItems: total,
                totalPages,
                currentPage: page,
                limit,
            },
        };
    }

    async getProductById(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: { select: { name: true } },
            },
        });

        if (!product) {
            throw new HttpException(404, "상품을 찾을 수 없습니다.");
        }

        return product;
    }
}