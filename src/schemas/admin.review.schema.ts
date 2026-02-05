import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

const TAG = "Admin/Reviews";

// --- Input Schemas ---

// 관리자용 검색 필터 (상품명, 유저명, 리뷰내용 통합 검색)
export const AdminReviewListQuerySchema = PaginationQuerySchema.extend({
    search: z
        .string()
        .optional()
        .openapi({ description: "검색어 (리뷰 내용, 작성자 아이디, 상품명)" }),
    productId: z.coerce
        .number()
        .optional()
        .openapi({ description: "특정 상품의 리뷰만 볼 경우 ID 입력" }),
});

export const AdminReviewIdParamSchema = z.object({
    reviewId: z.coerce.number().min(1).openapi({ example: 1 }),
});

// --- Output Schemas ---

const AdminReviewResponseSchema = z.object({
    id: z.number(),
    rating: z.number(),
    content: z.string(),
    createdAt: z.date(),
    productName: z.string(), // 어떤 상품에 달린 리뷰인지
    writer: z.object({
        id: z.number(),
        username: z.string(),
        name: z.string(),
    }),
    images: z.array(z.object({ id: z.number(), url: z.string() })),
});

export const AdminPaginatedReviewListSchema =
    createPaginatedResponseSchema(AdminReviewResponseSchema);

// --- API Registry ---

registry.registerPath({
    method: "get",
    path: "/admin/reviews",
    tags: [TAG],
    summary: "전체 리뷰 목록 조회 (관리자)",
    description: "전체 리뷰를 최신순으로 조회하며, 검색어 필터링을 지원합니다.",
    security: [{ bearerAuth: [] }],
    request: { query: AdminReviewListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: AdminPaginatedReviewListSchema } },
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/reviews/{reviewId}",
    tags: [TAG],
    summary: "리뷰 강제 삭제",
    description: "부적절한 리뷰를 관리자 권한으로 삭제합니다.",
    security: [{ bearerAuth: [] }],
    request: { params: AdminReviewIdParamSchema },
    responses: {
        200: { description: "삭제 성공" },
        404: { description: "리뷰 없음" },
    },
});

export type AdminReviewListQuery = z.infer<typeof AdminReviewListQuerySchema>;
