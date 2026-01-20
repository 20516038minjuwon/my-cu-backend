export const components = {
    securitySchemes: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        },
    },
    schemas: {
        // 회원가입 입력 스키마
        RegisterFormInput: {
            type: "object",
            required: [
                "username",
                "name",
                "email",
                "password",
                "password_confirm",
                "phone",
                "birthdate",
            ],
            properties: {
                username: { type: "string", example: "user123" },
                name: { type: "string", example: "홍길동" },
                email: { type: "string", format: "email", example: "user@example.com" },
                password: { type: "string", format: "password", example: "password123!" },
                password_confirm: {
                    type: "string",
                    format: "password",
                    description: "비밀번호 확인",
                    example: "password123!",
                },
                phone: { type: "string", example: "010-1234-5678" },
                birthdate: {
                    type: "string",
                    description: "생년월일 (String)",
                    example: "1990-01-01",
                },
            },
        },
        // 로그인 입력 스키마
        LoginFormInput: {
            type: "object",
            required: ["username", "password"],
            properties: {
                username: { type: "string", example: "user123" },
                password: { type: "string", format: "password", example: "password123!" },
            },
        },
        // 공통 응답 스키마 (User 정보 등)
        UserResponse: {
            type: "object",
            properties: {
                id: { type: "integer", example: 1 },
                username: { type: "string", example: "user123" },
                name: { type: "string", example: "홍길동" },
                email: { type: "string", example: "user@example.com" },
                phone: { type: "string", example: "010-1234-5678" },
                birthdate: { type: "string", example: "1990-01-01" },
                role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
            },
        },
    },
};
