export const authPaths = {
    "/api/auth/register": {
        post: {
            summary: "회원가입",
            description: "User 정보와 RegisterFormType을 기반으로 회원을 생성합니다.",
            tags: ["Auth"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/RegisterFormInput",
                        },
                    },
                },
            },
            responses: {
                "201": {
                    description: "회원가입 성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "회원가입에 성공했습니다.",
                                    },
                                    data: { $ref: "#/components/schemas/UserResponse" },
                                },
                            },
                        },
                    },
                },
                "400": {
                    description: "잘못된 요청 (비밀번호 불일치)",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "비밀번호가 일치하지 않습니다." },
                                },
                            },
                        },
                    },
                },
                "409": {
                    description: "리소스 충돌 (이메일 중복)",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "이미 존재하는 이메일입니다." },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    "/api/auth/login": {
        post: {
            summary: "로그인",
            description: "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.",
            tags: ["Auth"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/LoginFormInput",
                        },
                    },
                },
            },
            responses: {
                "200": {
                    description: "로그인 성공",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "로그인 성공" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            token: {
                                                type: "string",
                                                description: "JWT Access Token",
                                            },
                                            user: { $ref: "#/components/schemas/UserResponse" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "405": {
                    description: "이메일이나 비밀번호 검증 실패",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "아이디나 비밀번호가 일치하지 않습니다." },
                                },
                            },
                        },
                    },
                },

            },
        },
    },
};
