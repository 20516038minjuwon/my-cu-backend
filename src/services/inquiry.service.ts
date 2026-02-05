import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { CreateInquiryInput, InquiryListQuery } from "../schemas/inquiry.schema";
import { Prisma } from "@prisma/client";

export class InquiryService {
    async createInquiry(userId: number, data: CreateInquiryInput) {
        const { type, title, content, images } = data;

        return await prisma.inquiry.create({
            data: {
                userId,
                type,
                title,
                content,
                status: "PENDING", // 기본값
                images: {
                    create: images.map(url => ({ url })),
                },
            },
            include: {
                images: true,
            },
        });
    }

    // 2. 내 문의 목록 조회
    async getMyInquiries(userId: number, query: InquiryListQuery) {
        const { page, limit, type } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.InquiryWhereInput = {
            userId, // 본인 것만
        };

        if (type) {
            where.type = type;
        }

        const [totalItems, inquiries] = await Promise.all([
            prisma.inquiry.count({ where }),
            prisma.inquiry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    images: true,
                },
            }),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data: inquiries,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    }

    // 3. 문의 상세 조회
    async getInquiryById(userId: number, inquiryId: number) {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id: inquiryId },
            include: {
                images: true,
            },
        });

        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");
        if (inquiry.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        return inquiry;
    }

    // 4. 문의 삭제
    async deleteInquiry(userId: number, inquiryId: number) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });

        if (!inquiry) throw new HttpException(404, "문의 내역을 찾을 수 없습니다.");
        if (inquiry.userId !== userId) throw new HttpException(403, "권한이 없습니다.");
        
        if (inquiry.status === "ANSWERED") throw new HttpException(400, "답변이 완료된 문의는 삭제할 수 없습니다.");

        await prisma.inquiry.delete({ where: { id: inquiryId } });

        return { message: "문의가 삭제되었습니다.", deletedId: inquiryId };
    }
}
