import { Request, Response, NextFunction } from "express";
import { InquiryService } from "../services/inquiry.service";
import { CreateInquiryInput, InquiryListQuery } from "../schemas/inquiry.schema";

const inquiryService = new InquiryService();

export class InquiryController {
    async createInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const body = req.body as CreateInquiryInput;

            const result = await inquiryService.createInquiry(userId, body);
            res.status(201).json({ message: "문의가 등록되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMyInquiries(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const query = req.query as unknown as InquiryListQuery;

            const result = await inquiryService.getMyInquiries(userId, query);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getInquiryById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const params = req.params as unknown as { id: string };
            const id = Number(params.id);

            const result = await inquiryService.getInquiryById(userId, id);
            res.status(200).json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteInquiry(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);
            const params = req.params as unknown as { id: string };
            const id = Number(params.id);

            const result = await inquiryService.deleteInquiry(userId, id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
