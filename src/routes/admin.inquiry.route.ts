import { Router } from "express";
import { AdminInquiryController } from "../controllers/admin.inquiry.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/admin.middleware";
import { validateQuery, validateParams, validateBody } from "../middlewares/validation.middleware";
import {
    AdminInquiryListQuerySchema,
    InquiryIdParamSchema,
    AdminAnswerInquirySchema,
} from "../schemas/admin.inquiry.schema";

const router = Router();
const controller = new AdminInquiryController();

// 관리자 권한 체크
router.use(authenticateJwt, isAdmin);

// 1. 목록 조회
router.get("/", validateQuery(AdminInquiryListQuerySchema), controller.getInquiries);

// 2. 상세 조회
router.get("/:id", validateParams(InquiryIdParamSchema), controller.getInquiryById);

// 3. 답변 등록 (PATCH)
router.patch(
    "/:id/answer",
    validateParams(InquiryIdParamSchema),
    validateBody(AdminAnswerInquirySchema),
    controller.answerInquiry,
);

// 4. 삭제
router.delete("/:id", validateParams(InquiryIdParamSchema), controller.deleteInquiry);

export default router;
