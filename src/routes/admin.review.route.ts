import { Router } from "express";
import { AdminReviewController } from "../controllers/admin.review.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateQuery, validateParams } from "../middlewares/validation.middleware";
import {
    AdminReviewListQuerySchema,
    AdminReviewIdParamSchema,
} from "../schemas/admin.review.schema";

const router = Router();
const controller = new AdminReviewController();
router.use(authenticateJwt, isAdmin);

router.get("/", validateQuery(AdminReviewListQuerySchema), controller.getReviews);
router.delete("/:reviewId", validateParams(AdminReviewIdParamSchema), controller.deleteReview);

export default router;
