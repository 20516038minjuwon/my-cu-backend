import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateProductInput, UpdateProductInput } from "../schemas/admin.product.schema";

export class AdminProductService {
    async createProduct(data: CreateProductInput) {
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });

        if (!category) {
            throw new HttpException(404, "존재하지 않는 카테고리입니다.");
        }

        return await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                categoryId: data.categoryId,
                isNew: data.isNew ?? false,
                isBest: data.isBest ?? false,
                onePlus: data.onePlus ?? false,
                twoPlus: data.twoPlus ?? false,
            },
        });
    }

    async updateProduct(id: number, data: UpdateProductInput) {
        // 1. 상품 존재 확인
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            throw new HttpException(404, "해당 상품을 찾을 수 없습니다.");
        }

        // 2. 카테고리가 변경되는 경우, 새 카테고리 존재 확인
        if (data.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!category) {
                throw new HttpException(404, "변경하려는 카테고리가 존재하지 않습니다.");
            }
        }

        // 3. 업데이트
        return await prisma.product.update({
            where: { id },
            data,
        });
    }

    async deleteProduct(id: number) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new HttpException(404, "해당 상품을 찾을 수 없습니다.");
        }

        await prisma.product.delete({
            where: { id },
        });

        return { message: "상품이 삭제되었습니다.", deletedId: id };
    }
}
