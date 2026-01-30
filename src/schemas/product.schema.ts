import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema } from "./common.schema";

extendZodWithOpenApi(z);

const TAG = "Products";

export const ProductListQuerySchema = PaginationQuerySchema.extend({
    categoryId: z.coerce.number().optional().openapi({ example: 1, description: "카테고리 ID 필터" }),
    isNew: z.coerce.boolean().optional().openapi({ example: true, description: "신상품 여부 (true/false)" }),
    isBest: z.coerce.boolean().optional().openapi({ example: false, description: "베스트 상품 여부 (true/false)" }),
    keyword: z.string().optional().openapi({ example: "맨투맨", description: "상품명 검색어" }),
    sort: z.enum(["latest", "lowPrice", "highPrice"]).default("latest").openapi({
        example: "latest",
        description: "정렬: latest(최신순), lowPrice(낮은가격순), highPrice(높은가격순)",
    }),
});

export const ProductIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1, description: "상품 ID" }),
});

export const ProductResponseSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "오버핏 맨투맨" }),
    description: z.string().openapi({ example: "편안한 면 소재입니다." }),
    price: z.number().openapi({ example: 35000 }),
    isNew: z.boolean().openapi({ example: true }),
    isBest: z.boolean().openapi({ example: false }),
    onePlus: z.boolean().openapi({ example: false }),
    twoPlus: z.boolean().openapi({ example: false }),
    categoryId: z.number().openapi({ example: 1 }),
    category: z.object({ name: z.string() }).optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
}).openapi("ProductResponse");

registry.registerPath({
    method: "get",
    path: "/products",
    tags: [TAG],
    summary: "상품 목록 조회",
    description: "카테고리, 태그(New/Best), 검색어, 정렬 조건을 이용하여 상품 목록을 조회합니다.",
    request: {
        query: ProductListQuerySchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        data: z.array(ProductResponseSchema),
                        pagination: z.object({
                            totalItems: z.number(),
                            totalPages: z.number(),
                            currentPage: z.number(),
                            limit: z.number(),
                        }),
                    }),
                },
            },
        },
    },
});

// 상품 상세 조회
registry.registerPath({
    method: "get",
    path: "/products/{id}",
    tags: [TAG],
    summary: "상품 상세 조회",
    description: "상품 ID를 통해 상세 정보를 조회합니다.",
    request: {
        params: ProductIdParamSchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: z.object({ data: ProductResponseSchema }) } },
        },
        404: { description: "상품 없음" },
    },
});

export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
export type ProductIdParam = z.infer<typeof ProductIdParamSchema>;