import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

export class CategoryService {
    async getCategories() {
        const categories = await prisma.category.findMany({
            orderBy: { id: "asc" },
        });

        const categoryMap = new Map();
        const roots: any[] = [];

        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        categories.forEach(cat => {
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(categoryMap.get(cat.id));
                }
            } else {
                roots.push(categoryMap.get(cat.id));
            }
        });

        return roots;
    }

    async getCategoryById(id: number) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
            },
        });

        if (!category) {
            throw new HttpException(404, "존재하지 않는 카테고리입니다.");
        }

        return category;
    }
}
