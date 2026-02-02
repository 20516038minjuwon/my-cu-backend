import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
});

export function generateOpenApiDocs() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: "3.0.0",
        info: {
            title: "MyCu 쇼핑몰 API",
            version: "1.0.0",
        },
        servers: [{ url: "/api" }],
        tags: [
            { name: "Auth", description: "사용자 측 회원 관련 서비스" },
            { name: "Categories", description: "사용자 측 카테고리 관련 서비스" },
            { name: "Products", description: "사용자 측 상품 관련 서비스" },
            { name: "Uploads", description: "파일 업로드 관련 서비스" },
            { name: "Admin/Users", description: "관리자 측 회원 관련 서비스" },
            { name: "Admin/Categories", description: "관리자 측 카테고리 관련 서비스" },
            { name: "Admin/Products", description: "관리자 측 상품 관련 서비스" },
        ],
        "x-tagGroups": [
            {
                name: "공용 API",
                tags: ["Auth", "Categories", "Products", "Uploads"],
            },
            {
                name: "관리자 API",
                tags: ["Admin/Users", "Admin/Categories", "Admin/Products"],
            },
        ],
    });
}
