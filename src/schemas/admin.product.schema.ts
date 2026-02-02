import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { ProductResponseSchema } from "./product.schema"; // 기존 응답 스키마 재사용

extendZodWithOpenApi(z);

const TAG = "Admin/Products";
export const CreateProductSchema = z
    .object({
        name: z.string().min(1, "상품명을 입력해주세요.").openapi({ example: "신상 자켓" }),
        description: z
            .string()
            .min(1, "상품 설명을 입력해주세요.")
            .openapi({ example: "가볍고 따뜻한 자켓입니다." }),
        price: z.number().min(0, "가격은 0원 이상이어야 합니다.").openapi({ example: 59000 }),
        categoryId: z.number().int().openapi({ example: 1, description: "카테고리 ID" }),

        isNew: z.boolean().optional().openapi({ example: true }),
        isBest: z.boolean().optional().openapi({ example: false }),
        onePlus: z.boolean().optional().openapi({ example: false }),
        twoPlus: z.boolean().optional().openapi({ example: false }),
    })
    .openapi("CreateProductInput");

export const UpdateProductSchema = z
    .object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
        categoryId: z.number().int().optional(),
        isNew: z.boolean().optional(),
        isBest: z.boolean().optional(),
        onePlus: z.boolean().optional(),
        twoPlus: z.boolean().optional(),
    })
    .openapi("UpdateProductInput");

export const ProductIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1 }),
});

registry.registerPath({
    method: "post",
    path: "/admin/products",
    tags: [TAG],
    summary: "상품 등록",
    description: "새로운 상품을 등록합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateProductSchema } } },
    },
    responses: {
        201: {
            description: "등록 성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string(), data: ProductResponseSchema }),
                },
            },
        },
        404: { description: "카테고리 없음" },
    },
});

registry.registerPath({
    method: "put",
    path: "/admin/products/{id}",
    tags: [TAG],
    summary: "상품 정보 수정",
    security: [{ bearerAuth: [] }],
    request: {
        params: ProductIdParamSchema,
        body: { content: { "application/json": { schema: UpdateProductSchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
        404: { description: "상품 또는 카테고리 없음" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/products/{id}",
    tags: [TAG],
    summary: "상품 삭제",
    security: [{ bearerAuth: [] }],
    request: {
        params: ProductIdParamSchema,
    },
    responses: {
        200: { description: "삭제 성공" },
        404: { description: "상품 없음" },
    },
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
