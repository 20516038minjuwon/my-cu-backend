import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

export const uploadResponseSchema = z.object({
    url: z.string().openapi({ example: "https://storage.googleapis.com/..." }),
});

export const deleteUploadSchema = z.object({
    url: z.url().openapi({ example: "https://storage.googleapis.com/..." }),
});

registry.registerPath({
    method: "post",
    path: "/uploads",
    summary: "이미지 업로드",
    description: "단일 이미지 파일을 업로드하고 URL을 반환합니다.",
    tags: ["Uploads"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                "multipart/form-data": {
                    schema: z.object({
                        file: z.any().openapi({ type: "string", format: "binary" }),
                        folder: z.string().default("uploads").openapi({
                            example: "products",
                            description: "저장할 폴더명 (예: products, users, reviews)"
                        }),
                    }),
                },
            },
        },
    },
    responses: {
        201: {
            description: "업로드 성공",
            content: { "application/json": { schema: uploadResponseSchema } },
        },
        400: { description: "파일 없음 또는 형식 오류" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/uploads",
    summary: "이미지 삭제",
    description: "업로드된 이미지 URL을 받아 스토리지에서 삭제합니다.",
    tags: ["Uploads"],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: { "application/json": { schema: deleteUploadSchema } },
        },
    },
    responses: {
        200: { description: "삭제 성공" },
    },
});
