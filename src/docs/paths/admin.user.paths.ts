export const adminUserPaths = {
    "/api/admin/users": {
        get: {
            summary: "전체 회원 목록 조회",
            tags: ["Admin Users"],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: "query",
                    name: "page",
                    schema: { type: "integer", default: 1 },
                    description: "페이지 번호",
                },
                {
                    in: "query",
                    name: "limit",
                    schema: { type: "integer", default: 10 },
                    description: "페이지당 항목 수",
                },
            ],
            responses: {
                "200": {
                    description: "조회 성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/UserResponse" },
                                    },
                                    pagination: {
                                        type: "object",
                                        properties: {
                                            totalUsers: { type: "integer", example: 100 },
                                            totalPages: { type: "integer", example: 10 },
                                            currentPage: { type: "integer", example: 1 },
                                            limit: { type: "integer", example: 10 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "403": { description: "권한 없음" },
            },
        },
        post: {
            summary: "회원 직접 생성 (관리자)",
            tags: ["Admin Users"],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["username", "name", "email", "password", "phone", "birthdate", "gender"],
                            properties: {
                                username: { type: "string" },
                                name: { type: "string" },
                                email: { type: "string", format: "email" },
                                password: { type: "string", format: "password" },
                                phone: { type: "string" },
                                birthdate: { type: "string" },
                                role: { type: "string", enum: ["USER", "ADMIN"], default: "USER" },
                            },
                        },
                    },
                },
            },
            responses: {
                "201": { description: "생성 성공" },
                "409": { description: "이메일 중복" },
            },
        },
    },
    "/api/admin/users/{id}": {
        get: {
            summary: "회원 상세 조회 (관리자)",
            tags: ["Admin Users"],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
            responses: {
                "200": {
                    description: "성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { data: { $ref: "#/components/schemas/UserResponse" } },
                            },
                        },
                    },
                },
                "404": { description: "회원 없음" },
            },
        },
        put: {
            summary: "회원 정보 수정 (관리자)",
            tags: ["Admin Users"],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
            requestBody: {
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                email: { type: "string", format: "email" },
                                password: { type: "string", format: "password" },
                                phone: { type: "string" },
                                birthdate: { type: "string" },
                                role: { type: "string", enum: ["USER", "ADMIN"] },
                            },
                        },
                    },
                },
            },
            responses: {
                "200": { description: "수정 성공" },
            },
        },
        delete: {
            summary: "회원 삭제 (관리자)",
            tags: ["Admin Users"],
            security: [{ bearerAuth: [] }],
            parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
            responses: {
                "200": { description: "삭제 성공" },
            },
        },
    },
};
