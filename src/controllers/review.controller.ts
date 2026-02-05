import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { CreateReviewInput, ReviewListQuery } from "../schemas/review.schema";
import { PaginationQuery } from "../schemas/common.schema";

const reviewService = new ReviewService();

export class ReviewController {
    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const body = req.body as CreateReviewInput;

            const review = await reviewService.createReview(userId, body);
            res.status(201).json({ message: "리뷰가 등록되었습니다.", data: review });
        } catch (error) {
            next(error);
        }
    }

    async getReviewsByProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as unknown as ReviewListQuery;
            const result = await reviewService.getReviewsByProduct(query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // 내 리뷰 목록 조회
    async getMyReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const query = req.query as unknown as PaginationQuery;

            const result = await reviewService.getMyReviews(userId, query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const params = req.params as unknown as { reviewId: string };
            const reviewId = Number(params.reviewId);

            const result = await reviewService.deleteReview(userId, reviewId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
