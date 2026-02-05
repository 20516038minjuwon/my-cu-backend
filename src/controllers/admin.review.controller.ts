import { Request, Response, NextFunction } from "express";
import { AdminReviewService } from "../services/admin.review.service";
import { AdminReviewListQuery } from "../schemas/admin.review.schema";

const adminReviewService = new AdminReviewService();

export class AdminReviewController {
    async getReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as unknown as AdminReviewListQuery;
            const result = await adminReviewService.getReviews(query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const params = req.params as unknown as { reviewId: string };
            const reviewId = Number(params.reviewId);

            const result = await adminReviewService.deleteReview(reviewId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
