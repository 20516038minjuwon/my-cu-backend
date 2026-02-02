import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { Role } from "@prisma/client";

extendZodWithOpenApi(z);
const TAG = "Admin/Users";

export const AdminUserResponseSchema = z
    .object({
        id: z.number().openapi({ example: 1 }),
        username: z.string().openapi({ example: "user123" }),
        name: z.string().openapi({ example: "홍길동" }),
        email: z.email().openapi({ example: "user@example.com" }),
        phone: z.string().openapi({ example: "010-1234-5678" }),
        birthdate: z.string().openapi({ example: "1990-01-01" }),
        role: z.enum(Role).openapi({ example: "USER" }),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .openapi("AdminUserResponse");

export const PaginationQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1).openapi({ example: 1, description: "페이지 번호" }),
    limit: z.coerce
        .number()
        .min(1)
        .default(10)
        .openapi({ example: 10, description: "페이지당 항목 수" }),
});

export const UserIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1, description: "사용자 ID" }),
});

export const CreateUserSchema = z
    .object({
        username: z.string().min(4).openapi({ example: "newadmin" }),
        name: z.string().min(2).openapi({ example: "관리자" }),
        email: z.email().openapi({ example: "admin@example.com" }),
        password: z.string().min(6).openapi({ example: "password123!" }),
        phone: z.string().openapi({ example: "010-9999-8888" }),
        birthdate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .openapi({ example: "1985-05-05" }),
        role: z.enum(Role).optional().openapi({ example: "ADMIN" }),
    })
    .openapi("AdminCreateUserForm");

// 회원 수정 스키마 (req.body) - 모든 필드 Optional
export const UpdateUserSchema = z
    .object({
        name: z.string().min(2).optional().openapi({ example: "수정된이름" }),
        email: z.email().optional().openapi({ example: "updated@example.com" }),
        password: z.string().min(6).optional().openapi({ example: "newpassword123!" }),
        phone: z.string().optional().openapi({ example: "010-7777-1111" }),
        birthdate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .optional(),
        role: z.enum(Role).optional(),
    })
    .openapi("AdminUpdateUserForm");

registry.registerPath({
    method: "get",
    path: "/admin/users",
    tags: [TAG],
    summary: "전체 회원 목록 조회",
    security: [{ bearerAuth: [] }],
    request: {
        query: PaginationQuerySchema,
    },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": {
                    schema: z.object({
                        data: z.array(AdminUserResponseSchema),
                        pagination: z.object({
                            totalUsers: z.number(),
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

registry.registerPath({
    method: "get",
    path: "/admin/users/{id}",
    tags: [TAG],
    summary: "회원 상세 조회",
    security: [{ bearerAuth: [] }],
    request: {
        params: UserIdParamSchema,
    },
    responses: {
        200: {
            description: "성공",
            content: {
                "application/json": { schema: z.object({ data: AdminUserResponseSchema }) },
            },
        },
        404: { description: "회원 없음" },
    },
});

registry.registerPath({
    method: "post",
    path: "/admin/users",
    tags: [TAG],
    summary: "회원 직접 생성 (관리자)",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: CreateUserSchema } } },
    },
    responses: {
        201: {
            description: "생성 성공",
            content: {
                "application/json": {
                    schema: z.object({ message: z.string(), data: AdminUserResponseSchema }),
                },
            },
        },
        409: { description: "아이디 중복" },
    },
});

registry.registerPath({
    method: "put",
    path: "/admin/users/{id}",
    tags: [TAG],
    summary: "회원 정보 수정 (관리자)",
    security: [{ bearerAuth: [] }],
    request: {
        params: UserIdParamSchema,
        body: { content: { "application/json": { schema: UpdateUserSchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/admin/users/{id}",
    tags: [TAG],
    summary: "회원 삭제 (관리자)",
    security: [{ bearerAuth: [] }],
    request: {
        params: UserIdParamSchema,
    },
    responses: {
        200: { description: "삭제 성공" },
    },
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type UserIdParam = z.infer<typeof UserIdParamSchema>;
