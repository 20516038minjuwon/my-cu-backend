import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { UserResponseSchema } from "./auth.schema"; // 기존 Auth 스키마 재사용 (응답용)

extendZodWithOpenApi(z);

const TAG = "Users";

export const UpdateProfileSchema = z
    .object({
        name: z.string().min(2).optional().openapi({ example: "김철수" }),
        email: z.email().optional().openapi({ example: "chulsoo@example.com" }),
        phone: z
            .string()
            .regex(/^\d{3}-\d{3,4}-\d{4}$/)
            .optional()
            .openapi({ example: "010-5678-1234" }),
        birthdate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional()
            .openapi({ example: "1995-05-05" }),
    })
    .openapi("UpdateProfileForm");

export const ChangePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "현재 비밀번호를 입력해주세요.")
            .openapi({ example: "oldpassword123!" }),
        newPassword: z
            .string()
            .min(6, "새 비밀번호는 6자 이상이어야 합니다.")
            .openapi({ example: "newpassword123!" }),
        newPasswordConfirm: z.string().min(1).openapi({ example: "newpassword123!" }),
    })
    .refine(data => data.newPassword === data.newPasswordConfirm, {
        message: "새 비밀번호가 일치하지 않습니다.",
        path: ["newPasswordConfirm"],
    })
    .openapi("ChangePasswordForm");

registry.registerPath({
    method: "get",
    path: "/users/me",
    tags: [TAG],
    summary: "내 정보 조회",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "성공",
            content: { "application/json": { schema: z.object({ data: UserResponseSchema }) } },
        },
    },
});

registry.registerPath({
    method: "put",
    path: "/users/me",
    tags: [TAG],
    summary: "내 정보 수정",
    description: "이름, 이메일, 전화번호, 생년월일을 수정합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: UpdateProfileSchema } } },
    },
    responses: {
        200: {
            description: "수정 성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string(), data: UserResponseSchema }),
                },
            },
        },
        409: { description: "이메일 중복" },
    },
});

registry.registerPath({
    method: "put",
    path: "/users/me/password",
    tags: [TAG],
    summary: "비밀번호 변경",
    description: "현재 비밀번호를 확인 후 새 비밀번호로 변경합니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: ChangePasswordSchema } } },
    },
    responses: {
        200: {
            description: "변경 성공",
            content: { "application/json": { schema: z.object({ message: z.string() }) } },
        },
        400: { description: "현재 비밀번호 불일치" },
    },
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
