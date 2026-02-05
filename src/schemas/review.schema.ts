import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

const TAG = "Reviews";

// --- Input Schemas ---

export const CreateReviewSchema = z
    .object({
        productId: z.number().min(1).openapi({ example: 1 }),
        content: z
            .string()
            .min(10, "리뷰는 10자 이상 작성해야 합니다.")
            .openapi({ example: "옷이 너무 예뻐요! 사이즈도 딱 맞습니다." }),
        rating: z
            .number()
            .min(1)
            .max(5)
            .int()
            .openapi({ example: 5, description: "별점 (1~5 정수)" }),

        // [중요] 이미지는 URL 문자열 배열로 받음
        images: z
            .array(z.string().url())
            .max(5, "이미지는 최대 5장까지 등록 가능합니다.")
            .optional()
            .default([])
            .openapi({
                example: [
                    "https://cdn.myshop.com/review1.jpg",
                    "https://cdn.myshop.com/review2.jpg",
                ],
                description: "업로드된 이미지 URL 목록",
            }),
    })
    .openapi("CreateReviewInput");

export const ReviewListQuerySchema = PaginationQuerySchema.extend({
    productId: z.coerce.number().min(1).openapi({ example: 1, description: "상품 ID (필수)" }),
});

export const ReviewIdParamSchema = z.object({
    reviewId: z.coerce.number().min(1).openapi({ example: 1 }),
});

// --- Output Schemas ---

const ReviewImageSchema = z.object({
    id: z.number(),
    url: z.string(),
});

const PublicReviewResponseSchema = z.object({
    id: z.number(),
    rating: z.number(),
    content: z.string(),
    createdAt: z.date(),
    writer: z.object({
        username: z.string(),
        name: z.string().openapi({ description: "마스킹된 이름 (홍*동)" }),
    }),
    images: z.array(ReviewImageSchema),
});

const MyReviewResponseSchema = z.object({
    id: z.number(),
    rating: z.number(),
    content: z.string(),
    createdAt: z.date(),
    product: z.object({
        id: z.number(),
        name: z.string(),
        image: z.string(),
    }),
    images: z.array(ReviewImageSchema),
});

export const PaginatedPublicReviewListSchema = createPaginatedResponseSchema(
    PublicReviewResponseSchema,
);
export const PaginatedMyReviewListSchema = createPaginatedResponseSchema(MyReviewResponseSchema);

// --- API Registry ---

registry.registerPath({
    method: "post",
    path: "/reviews",
    tags: [TAG],
    summary: "리뷰 작성",
    description: "배송이 완료된 상품에 대해서만 리뷰를 작성할 수 있습니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateReviewSchema } } },
    },
    responses: {
        201: { description: "리뷰 작성 성공" },
        400: { description: "구매 내역이 없거나 이미 작성함" },
    },
});

registry.registerPath({
    method: "get",
    path: "/reviews",
    tags: [TAG],
    summary: "상품 리뷰 목록 조회 (공개)",
    description: "특정 상품의 상세 페이지에서 보여줄 리뷰 목록입니다. 작성자 이름이 마스킹됩니다.",
    request: { query: ReviewListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: PaginatedPublicReviewListSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/reviews/me",
    tags: [TAG],
    summary: "내가 쓴 리뷰 목록 조회",
    description: "로그인한 사용자가 작성한 리뷰를 모아봅니다. 상품 정보가 함께 반환됩니다.",
    security: [{ bearerAuth: [] }],
    request: { query: PaginationQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: PaginatedMyReviewListSchema } },
        },
    },
});

registry.registerPath({
    method: "delete",
    path: "/reviews/{reviewId}",
    tags: [TAG],
    summary: "리뷰 삭제",
    security: [{ bearerAuth: [] }],
    request: { params: ReviewIdParamSchema },
    responses: {
        200: { description: "삭제 성공" },
        403: { description: "권한 없음" },
    },
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type ReviewListQuery = z.infer<typeof ReviewListQuerySchema>;
