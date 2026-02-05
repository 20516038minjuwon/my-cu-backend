import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateReviewInput, ReviewListQuery } from "../schemas/review.schema";
import { PaginationQuery } from "../schemas/common.schema";

export class ReviewService {
    // 1. 리뷰 작성
    async createReview(userId: number, data: CreateReviewInput) {
        const { productId, content, rating, images } = data;

        // (1) 상품 존재 확인
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new HttpException(404, "존재하지 않는 상품입니다.");

        // (2) 구매 내역 검증 ("배송 완료" 된 주문만 리뷰 가능)
        // OrderItem -> Order를 통해 조회
        const purchaseHistory = await prisma.orderItem.findFirst({
            where: {
                productId: productId,
                order: {
                    userId: userId,
                    status: "DELIVERED", // 배송 완료된 건만 허용
                },
            },
        });

        if (!purchaseHistory) {
            throw new HttpException(400, "배송이 완료된 상품만 리뷰를 작성할 수 있습니다.");
        }

        // (3) 중복 작성 방지 (선택 사항: 한 상품당 1회만 가능하게 할 경우)
        const existingReview = await prisma.review.findFirst({
            where: { userId, productId },
        });

        if (existingReview) {
            throw new HttpException(400, "이미 해당 상품에 대한 리뷰를 작성하셨습니다.");
        }

        return await prisma.review.create({
            data: {
                userId,
                productId,
                content,
                rating,
                // Prisma의 Nested Write 기능 사용
                images: {
                    create: images.map(url => ({ url })),
                },
            },
            include: {
                images: true,
            },
        });
    }

    async getReviewsByProduct(query: ReviewListQuery) {
        const { productId, page, limit } = query;
        const skip = (page - 1) * limit;

        // 상품 존재 여부 체크
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) throw new HttpException(404, "존재하지 않는 상품입니다.");

        const totalItems = await prisma.review.count({ where: { productId } });

        const reviews = await prisma.review.findMany({
            where: { productId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { username: true, name: true } }, // 작성자 정보 필요
                images: { select: { id: true, url: true } },
            },
        });

        // 작성자 이름 마스킹 처리 (홍길동 -> 홍*동)
        const data = reviews.map(review => {
            const name = review.user.name;
            const maskedName = name.length > 1 ? name[0] + "*".repeat(name.length - 1) : name;

            return {
                id: review.id,
                rating: review.rating,
                content: review.content,
                createdAt: review.createdAt,
                writer: {
                    username: review.user.username,
                    name: maskedName,
                },
                images: review.images,
            };
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    }

    // 2. [마이페이지용] 내가 쓴 리뷰 목록 (로그인 필수)
    async getMyReviews(userId: number, query: PaginationQuery) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const totalItems = await prisma.review.count({ where: { userId } });

        const reviews = await prisma.review.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                product: { select: { id: true, name: true, image: true } }, // 상품 정보 필요
                images: { select: { id: true, url: true } },
            },
        });

        // 내 리뷰이므로 작성자 정보는 필요 없고, 어떤 상품인지가 중요함
        const data = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            content: review.content,
            createdAt: review.createdAt,
            product: review.product,
            images: review.images,
        }));

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    }

    // 3. 리뷰 삭제
    async deleteReview(userId: number, reviewId: number) {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) throw new HttpException(404, "리뷰를 찾을 수 없습니다.");

        // 본인 확인
        if (review.userId !== userId) {
            throw new HttpException(403, "삭제 권한이 없습니다.");
        }

        await prisma.review.delete({ where: { id: reviewId } });

        return { message: "리뷰가 삭제되었습니다.", deletedId: reviewId };
    }
}
