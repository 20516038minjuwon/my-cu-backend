import { Request, Response, NextFunction } from "express";
import { AdminInquiryService } from "../services/admin.inquiry.service";
import { AdminInquiryListQuery, AdminAnswerInquiryInput } from "../schemas/admin.inquiry.schema";

const service = new AdminInquiryService();

export class AdminInquiryController {
    async getInquiries(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query as unknown as AdminInquiryListQuery;
            const result = await service.getInquiries(query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getInquiryById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await service.getInquiryById(id);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async answerInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const body = req.body as AdminAnswerInquiryInput;

            const result = await service.answerInquiry(id, body);
            res.status(200).json({ message: "답변이 등록되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const result = await service.deleteInquiry(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
