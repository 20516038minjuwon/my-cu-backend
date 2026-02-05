// src/schemas/inquiry.schema.ts
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";
import { InquiryStatus, InquiryType } from "@prisma/client";

extendZodWithOpenApi(z);

const TAG = "Inquiries";

export const CreateInquirySchema = z
    .object({
        type: z.enum(InquiryType).openapi({
            example: "DELIVERY",
            description: "문의 유형 (DELIVERY, PRODUCT, EXCHANGE_RETURN, MEMBER, OTHER)",
        }),
        title: z
            .string()
            .min(1, "제목을 입력해주세요.")
            .max(100)
            .openapi({ example: "배송이 언제 시작되나요?" }),
        content: z
            .string()
            .min(10, "내용은 10자 이상 입력해주세요.")
            .openapi({ example: "주문한지 3일 지났는데 아직 배송준비중입니다." }),
        images: z
            .array(z.url())
            .max(3, "이미지는 최대 3장까지 첨부 가능합니다.")
            .optional()
            .default([])
            .openapi({ example: ["https://cdn.com/1.jpg"] }),
    })
    .openapi("CreateInquiryInput");

// 필터링 기능 (유형별 조회)
export const InquiryListQuerySchema = PaginationQuerySchema.extend({
    type: z
        .enum(InquiryType)
        .optional()
        .openapi({ description: "특정 유형만 조회하고 싶을 때 사용" }),
});

export const InquiryParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1 }),
});

// --- Output Schemas ---

const InquiryImageSchema = z.object({
    id: z.number(),
    url: z.string(),
});

const InquiryResponseSchema = z.object({
    id: z.number(),
    type: z.enum(InquiryType),
    title: z.string(),
    content: z.string(),
    status: z.enum(InquiryStatus), // PENDING, ANSWERED
    answer: z.string().nullable().openapi({ description: "관리자 답변 (답변 대기중이면 null)" }),
    createdAt: z.date(),
    answeredAt: z.date().nullable().optional(), // 답변 달린 시간 (Service에서 처리 필요)
    images: z.array(InquiryImageSchema),
});

export const PaginatedInquiryListSchema = createPaginatedResponseSchema(InquiryResponseSchema);

// --- API Registry ---

registry.registerPath({
    method: "post",
    path: "/inquiries",
    tags: [TAG],
    summary: "1:1 문의 등록",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateInquirySchema } } },
    },
    responses: {
        201: { description: "문의 등록 성공" },
    },
});

registry.registerPath({
    method: "get",
    path: "/inquiries",
    tags: [TAG],
    summary: "내 문의 내역 조회",
    description: "본인이 작성한 문의 내역을 최신순으로 조회합니다.",
    security: [{ bearerAuth: [] }],
    request: { query: InquiryListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: PaginatedInquiryListSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/inquiries/{id}",
    tags: [TAG],
    summary: "문의 상세 조회",
    description: "문의 내용과 관리자 답변을 확인합니다.",
    security: [{ bearerAuth: [] }],
    request: { params: InquiryParamSchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: z.object({ data: InquiryResponseSchema }) } },
        },
        404: { description: "문의 내역 없음" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/inquiries/{id}",
    tags: [TAG],
    summary: "문의 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: InquiryParamSchema },
    responses: {
        200: { description: "삭제 성공" },
        403: { description: "권한 없음" },
    },
});

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type InquiryListQuery = z.infer<typeof InquiryListQuerySchema>;
