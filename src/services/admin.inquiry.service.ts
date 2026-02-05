import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { Prisma } from "@prisma/client";
import { AdminAnswerInquiryInput, AdminInquiryListQuery } from "../schemas/admin.inquiry.schema";

export class AdminInquiryService {
    // 1. 전체 문의 목록 조회 (검색 및 필터링)
    async getInquiries(query: AdminInquiryListQuery) {
        const { page, limit, status, type, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.InquiryWhereInput = {};

        // 필터링
        if (status) where.status = status;
        if (type) where.type = type;

        // 검색 (제목, 내용, 작성자 정보)
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { content: { contains: search } },
                { user: { username: { contains: search } } },
                { user: { name: { contains: search } } },
            ];
        }

        const [totalItems, inquiries] = await Promise.all([
            prisma.inquiry.count({ where }),
            prisma.inquiry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }, // 최신순
                include: {
                    user: { select: { id: true, username: true, name: true } },
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

    // 2. 문의 상세 조회
    async getInquiryById(id: number) {
        const inquiry = await prisma.inquiry.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, username: true, name: true, email: true, phone: true },
                },
                images: true,
            },
        });

        if (!inquiry) throw new HttpException(404, "해당 문의를 찾을 수 없습니다.");

        return inquiry;
    }

    // 3. 답변 등록 및 수정
    async answerInquiry(id: number, data: AdminAnswerInquiryInput) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry) throw new HttpException(404, "해당 문의를 찾을 수 없습니다.");

        return await prisma.inquiry.update({
            where: { id },
            data: {
                answer: data.answer,
                status: "ANSWERED",
            },
        });
    }

    // 4. 문의 삭제 (관리자 권한)
    async deleteInquiry(id: number) {
        const inquiry = await prisma.inquiry.findUnique({ where: { id } });
        if (!inquiry) throw new HttpException(404, "해당 문의를 찾을 수 없습니다.");

        await prisma.inquiry.delete({ where: { id } });

        return { message: "문의가 삭제되었습니다.", deletedId: id };
    }
}
