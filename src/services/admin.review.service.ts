import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { Prisma } from "@prisma/client";
import { AdminReviewListQuery } from "../schemas/admin.review.schema";

export class AdminReviewService {
    // 1. 전체 리뷰 조회 (검색 기능 포함)
    async getReviews(query: AdminReviewListQuery) {
        const { page, limit, search, productId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ReviewWhereInput = {};

        // 특정 상품 필터
        if (productId) {
            where.productId = productId;
        }

        // 통합 검색 (리뷰 내용, 유저명, 상품명)
        if (search) {
            where.OR = [
                { content: { contains: search } }, // 리뷰 내용
                { user: { username: { contains: search } } }, // 작성자 아이디
                { user: { name: { contains: search } } }, // 작성자 실명
                { product: { name: { contains: search } } }, // 상품명
            ];
        }

        // 전체 개수 및 데이터 조회
        const [totalItems, reviews] = await Promise.all([
            prisma.review.count({ where }),
            prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { id: true, username: true, name: true } },
                    product: { select: { name: true } },
                    images: true,
                },
            }),
        ]);

        const data = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            content: review.content,
            createdAt: review.createdAt,
            productName: review.product.name,
            writer: review.user,
            images: review.images,
        }));

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    }

    // 2. 리뷰 강제 삭제
    async deleteReview(reviewId: number) {
        // 존재 여부 확인
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");

        // 삭제 수행
        await prisma.review.delete({ where: { id: reviewId } });

        return { message: "관리자 권한으로 리뷰가 삭제되었습니다.", deletedId: reviewId };
    }
}
