import { Router } from "express";
import { InquiryController } from "../controllers/inquiry.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validateBody, validateQuery, validateParams } from "../middlewares/validation.middleware";
import {
    CreateInquirySchema,
    InquiryListQuerySchema,
    InquiryParamSchema,
} from "../schemas/inquiry.schema";

const router = Router();
const inquiryController = new InquiryController();

router.use(authenticateJwt);

// 1. 등록
router.post("/", validateBody(CreateInquirySchema), inquiryController.createInquiry);

// 2. 목록 조회 (필터 및 페이징)
router.get("/", validateQuery(InquiryListQuerySchema), inquiryController.getMyInquiries);

// 3. 상세 조회
router.get("/:id", validateParams(InquiryParamSchema), inquiryController.getInquiryById);

// 4. 삭제
router.delete("/:id", validateParams(InquiryParamSchema), inquiryController.deleteInquiry);

export default router;
