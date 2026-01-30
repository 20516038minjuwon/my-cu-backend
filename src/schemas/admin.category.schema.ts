import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const TAG = "Admin / Categories";

export const CreateCategorySchema = z
    .object({
        name: z.string().min(1, "카테고리명을 입력해주세요.").openapi({ example: "상의" }),
        parentId: z
            .number()
            .optional()
            .nullable()
            .openapi({ example: null, description: "상위 카테고리 ID (없으면 1차)" }),
    })
    .openapi("CreateCategoryInput");

export const UpdateCategorySchema = z
    .object({
        name: z.string().min(1).optional().openapi({ example: "수정된 상의" }),
        parentId: z.number().optional().nullable().openapi({ example: 2 }),
    })
    .openapi("UpdateCategoryInput");

export const CategoryIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1 }),
});

registry.registerPath({
    method: "post",
    path: "/admin/categories",
    tags: [TAG],
    summary: "카테고리 생성",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateCategorySchema } } },
    },
    responses: {
        201: {
            description: "생성 성공",
            content: {
                "application/json": { schema: z.object({ message: z.string(), data: z.any() }) },
            },
        },
        400: { description: "상위 카테고리가 존재하지 않음" },
    },
});

registry.registerPath({
    method: "put",
    path: "/admin/categories/{id}",
    tags: [TAG],
    summary: "카테고리 수정",
    security: [{ bearerAuth: [] }],
    request: {
        params: CategoryIdParamSchema,
        body: { content: { "application/json": { schema: UpdateCategorySchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
        400: { description: "자기 자신을 부모로 설정 불가" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/categories/{id}",
    tags: [TAG],
    summary: "카테고리 삭제",
    description: "하위 카테고리나 연결된 상품이 있으면 삭제할 수 없습니다.",
    security: [{ bearerAuth: [] }],
    request: {
        params: CategoryIdParamSchema,
    },
    responses: {
        200: { description: "삭제 성공" },
        400: { description: "삭제 불가 (하위 항목 존재)" },
    },
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
