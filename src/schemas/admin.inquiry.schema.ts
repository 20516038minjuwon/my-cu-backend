import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { InquiryType, InquiryStatus } from "@prisma/client";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

const TAG = "Admin/Inquiries";

// --- Input Schemas ---

// 1. 문의 목록 검색 필터
export const AdminInquiryListQuerySchema = PaginationQuerySchema.extend({
    status: z
        .enum(InquiryStatus)
        .optional()
        .openapi({ description: "답변 상태 (PENDING: 대기중, ANSWERED: 답변완료)" }),
    type: z.enum(InquiryType).optional().openapi({ description: "문의 유형" }),
    search: z
        .string()
        .optional()
        .openapi({ description: "검색어 (제목, 내용, 작성자 아이디/이름)" }),
});

// 2. 답변 등록 (수정)
export const AdminAnswerInquirySchema = z
    .object({
        answer: z
            .string()
            .min(1, "답변 내용을 입력해주세요.")
            .openapi({ example: "네, 해당 상품은 3일 내 배송 예정입니다." }),
    })
    .openapi("AdminAnswerInquiryInput");

export const InquiryIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1 }),
});

// --- Output Schemas ---

const AdminInquiryResponseSchema = z.object({
    id: z.number(),
    type: z.enum(InquiryType),
    title: z.string(),
    content: z.string(),
    status: z.enum(InquiryStatus),
    answer: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(), // 답변 일시 등 확인용

    // 관리자는 누가 질문했는지 알아야 함
    user: z.object({
        id: z.number(),
        username: z.string(),
        name: z.string(),
    }),
    images: z.array(z.object({ id: z.number(), url: z.string() })),
});

export const AdminPaginatedInquiryListSchema = createPaginatedResponseSchema(
    AdminInquiryResponseSchema,
);

// --- API Registry ---

registry.registerPath({
    method: "get",
    path: "/admin/inquiries",
    tags: [TAG],
    summary: "전체 1:1 문의 조회 (관리자)",
    description: "전체 유저의 문의를 조회합니다. 답변 대기중인 건만 필터링할 수 있습니다.",
    security: [{ bearerAuth: [] }],
    request: { query: AdminInquiryListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: AdminPaginatedInquiryListSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/admin/inquiries/{id}",
    tags: [TAG],
    summary: "문의 상세 조회 (관리자)",
    security: [{ bearerAuth: [] }],
    request: { params: InquiryIdParamSchema },
    responses: {
        200: { description: "상세 조회 성공" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/admin/inquiries/{id}/answer",
    tags: [TAG],
    summary: "문의 답변 등록/수정",
    description: "답변을 등록하면 상태가 자동으로 ANSWERED로 변경됩니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: InquiryIdParamSchema,
        body: { content: { "application/json": { schema: AdminAnswerInquirySchema } } },
    },
    responses: {
        200: { description: "답변 등록 성공" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/inquiries/{id}",
    tags: [TAG],
    summary: "문의 강제 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: InquiryIdParamSchema },
    responses: { 200: { description: "삭제 성공" } },
});

export type AdminInquiryListQuery = z.infer<typeof AdminInquiryListQuerySchema>;
export type AdminAnswerInquiryInput = z.infer<typeof AdminAnswerInquirySchema>;
