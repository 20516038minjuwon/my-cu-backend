import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { OrderStatus } from "@prisma/client"; // Prisma Enum 사용
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

const TAG = "Admin/Orders";

// --- Input Schemas ---

// 1. 주문 목록 조회 (검색 필터 포함)
export const AdminOrderListQuerySchema = PaginationQuerySchema.extend({
    status: z
        .nativeEnum(OrderStatus)
        .optional()
        .openapi({ description: "주문 상태 필터 (예: PENDING, PAID, SHIPPED)" }),
    search: z
        .string()
        .optional()
        .openapi({ description: "검색어 (수령인 이름, 주문자명, 아이디 등)" }),
});

// 2. 주문 상태 변경 (운송장 번호 포함)
export const AdminUpdateOrderSchema = z
    .object({
        status: z
            .nativeEnum(OrderStatus)
            .openapi({ example: "SHIPPED", description: "변경할 주문 상태" }),

        // 배송 중(SHIPPED)으로 변경 시 필요한 정보
        trackingNumber: z
            .string()
            .optional()
            .openapi({ example: "1234567890", description: "운송장 번호" }),
        carrier: z.string().optional().openapi({ example: "CJ대한통운", description: "택배사" }),
    })
    .openapi("AdminUpdateOrderInput");

export const OrderIdParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1 }),
});

// --- Output Schemas (기존 OrderResponse 재활용 가능하지만, 관리자용은 더 상세할 수 있음) ---

const AdminOrderSummarySchema = z.object({
    id: z.number(),
    orderNo: z.string(),
    totalPrice: z.number(),
    status: z.nativeEnum(OrderStatus),
    createdAt: z.date(),
    recipientName: z.string(),
    username: z.string().openapi({ description: "주문자 아이디" }), // 관리자는 누가 샀는지 봐야 함
    itemsSummary: z.string(),
});

export const AdminOrderListResponseSchema = createPaginatedResponseSchema(AdminOrderSummarySchema);

// --- API Registry ---

registry.registerPath({
    method: "get",
    path: "/admin/orders",
    tags: [TAG],
    summary: "전체 주문 목록 조회 (관리자)",
    security: [{ bearerAuth: [] }],
    request: { query: AdminOrderListQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: AdminOrderListResponseSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/admin/orders/{id}",
    tags: [TAG],
    summary: "주문 상세 조회 (관리자)",
    security: [{ bearerAuth: [] }],
    request: { params: OrderIdParamSchema },
    responses: {
        200: { description: "상세 조회 성공 (구조는 사용자용 상세와 유사하므로 생략)" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/admin/orders/{id}/status",
    tags: [TAG],
    summary: "주문 상태 변경 및 운송장 입력",
    security: [{ bearerAuth: [] }],
    request: {
        params: OrderIdParamSchema,
        body: { content: { "application/json": { schema: AdminUpdateOrderSchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
    },
});

export type AdminOrderListQuery = z.infer<typeof AdminOrderListQuerySchema>;
export type AdminUpdateOrderInput = z.infer<typeof AdminUpdateOrderSchema>;
