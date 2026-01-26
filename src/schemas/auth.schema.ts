import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { Role } from "@prisma/client";

extendZodWithOpenApi(z);

export const UserResponseSchema = z.object({
    id: z.number().openapi({ example: 1 }),
    username: z.string().openapi({ example: "user123" }),
    name: z.string().openapi({ example: "홍길동" }),
    email: z.email().openapi({ example: "user@example.com" }),
    phone: z.string().openapi({ example: "010-1234-5678" }),
    birthdate: z.string().openapi({ example: "1990-01-01" }),
    role: z.enum(Role).openapi({ example: "USER" }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
}).openapi("UserResponse");

export const RegisterSchema = z
    .object({
        username: z.string().min(4, "아이디는 4자 이상이어야 합니다.").openapi({ example: "user123" }),
        name: z.string().min(2, "이름은 2자 이상이어야 합니다.").openapi({ example: "홍길동" }),
        email: z.email("이메일 형식이 아닙니다.").openapi({ example: "user@example.com" }),
        phone: z.string().regex(/^\d{3}-\d{3,4}-\d{4}$/, "전화번호 형식이 올바르지 않습니다.").openapi({ example: "010-1234-5678" }),
        birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "생년월일은 YYYY-MM-DD 형식이어야 합니다.").openapi({ example: "1990-01-01" }),
        password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다.").openapi({ example: "password123!" }),
        password_confirm: z.string().openapi({ example: "password123!" }),
    })
    .refine((data) => data.password === data.password_confirm, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["password_confirm"],
    })
    .openapi("RegisterInput");

export const LoginSchema = z.object({
    username: z.string().openapi({ example: "user123" }),
    password: z.string().openapi({ example: "password123!" }),
}).openapi("LoginInput");

registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    summary: "회원가입",
    description: "새로운 사용자를 등록합니다.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: RegisterSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "회원가입 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string().openapi({ example: "회원가입에 성공했습니다." }),
                        data: UserResponseSchema,
                    }),
                },
            },
        },
        400: { description: "유효성 검사 실패 (비밀번호 불일치 등)" },
        409: { description: "이미 존재하는 사용자" },
    },
});

registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "로그인",
    description: "아이디와 비밀번호로 로그인하여 토큰을 발급받습니다.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: LoginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "로그인 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string().openapi({ example: "로그인 성공" }),
                        data: z.object({
                            token: z.string(),
                            user: UserResponseSchema,
                        }),
                    }),
                },
            },
        },
        405: { description: "아이디 또는 비밀번호 불일치" },
    },
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;