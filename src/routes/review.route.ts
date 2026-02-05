import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middlewares/validation.middleware";
import {
    CreateReviewSchema,
    ReviewListQuerySchema,
    ReviewIdParamSchema,
} from "../schemas/review.schema";
import { PaginationQuerySchema } from "../schemas/common.schema";

const router = Router();
const reviewController = new ReviewController();

router.get("/", validateQuery(ReviewListQuerySchema), reviewController.getReviewsByProduct);
router.get(
    "/me",
    authenticateJwt,
    validateQuery(PaginationQuerySchema),
    reviewController.getMyReviews,
);
router.post("/", authenticateJwt, validateBody(CreateReviewSchema), reviewController.createReview);
router.delete(
    "/:reviewId",
    authenticateJwt,
    validateParams(ReviewIdParamSchema),
    reviewController.deleteReview,
);

export default router;
