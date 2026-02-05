import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const OPEN_API_TAG = "Categories";

const CategoryBase = z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "의류" }),
    parentId: z.number().nullable().openapi({ example: null }),
});

export const CategoryTreeResponseSchema: z.ZodType<any> = CategoryBase.extend({
    children: z.lazy(() => CategoryTreeResponseSchema.array().optional()),
}).openapi("CategoryTreeResponse");

export const CategoryDetailResponseSchema = CategoryBase.extend({
    children: z.array(CategoryBase).optional(),
}).openapi("CategoryDetailResponse");

export const CategoryIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1, description: "카테고리 ID" }),
});

registry.registerPath({
    method: "get",
    path: "/categories",
    tags: [OPEN_API_TAG],
    summary: "전체 카테고리 목록 조회",
    description: "전체 카테고리를 계층형 트리 구조로 조회합니다.",
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({ data: z.array(CategoryTreeResponseSchema) }),
                },
            },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/categories/{id}",
    tags: [OPEN_API_TAG],
    summary: "카테고리 상세 조회",
    description: "특정 카테고리의 정보와 바로 아래 하위 카테고리 목록을 조회합니다.",
    request: {
        params: CategoryIdParamSchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": { schema: z.object({ data: CategoryDetailResponseSchema }) },
            },
        },
        404: { description: "카테고리 없음" },
    },
});

export type CategoryIdParam = z.infer<typeof CategoryIdParamSchema>;