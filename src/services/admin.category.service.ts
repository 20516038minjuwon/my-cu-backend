import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/admin.category.schema";

export class AdminCategoryService {
    async createCategory(data: CreateCategoryInput) {
        // 상위 카테고리가 지정된 경우 존재 여부 확인
        if (data.parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: data.parentId },
            });
            if (!parent) {
                throw new HttpException(404, "지정된 상위 카테고리를 찾을 수 없습니다.");
            }
        }

        return await prisma.category.create({
            data: {
                name: data.name,
                parentId: data.parentId,
            },
        });
    }

    async updateCategory(id: number, data: UpdateCategoryInput) {
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) throw new HttpException(404, "해당 카테고리를 찾을 수 없습니다.");

        if (data.parentId) {
            // 자기 자신을 부모로 설정 방지
            if (data.parentId === id) {
                throw new HttpException(400, "자기 자신을 상위 카테고리로 설정할 수 없습니다.");
            }

            const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
            if (!parent) throw new HttpException(404, "지정된 상위 카테고리를 찾을 수 없습니다.");
        }

        return await prisma.category.update({
            where: { id },
            data,
        });
    }

    async deleteCategory(id: number) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: { children: true },
        });

        if (!category) throw new HttpException(404, "해당 카테고리를 찾을 수 없습니다.");

        // 1. 하위 카테고리가 있는지 확인
        if (category.children.length > 0) {
            throw new HttpException(400, "하위 카테고리가 존재하여 삭제할 수 없습니다.");
        }

        // 2. 연결된 상품이 있는지 확인
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            throw new HttpException(400, "해당 카테고리에 등록된 상품이 있어 삭제할 수 없습니다.");
        }

        await prisma.category.delete({ where: { id } });

        return { message: "카테고리가 성공적으로 삭제되었습니다.", deletedId: id };
    }
}