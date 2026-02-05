// src/schemas/order.schema.ts
import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";
import { PaginationQuerySchema, createPaginatedResponseSchema } from "./common.schema";

extendZodWithOpenApi(z);

const TAG = "Orders";

// --- Input Schemas ---

// 바로 구매 시 들어올 개별 상품 정보
const OrderItemInputSchema = z.object({
    productId: z.number().min(1).openapi({ example: 1 }),
    quantity: z.number().min(1).openapi({ example: 2 }),
});

export const CreateOrderSchema = z
    .object({
        // items가 있으면 '바로 구매', 없거나 빈 배열이면 '장바구니 전체 구매'
        items: z.array(OrderItemInputSchema).optional().openapi({
            description:
                "바로 구매 시 상품 목록 (비워두면 장바구니에 있는 모든 상품으로 주문 생성)",
        }),
        recipientName: z.string().min(1).openapi({ example: "홍길동" }),
        recipientPhone: z.string().min(1).openapi({ example: "010-1234-5678" }),
        zipCode: z.string().min(1).openapi({ example: "12345" }),
        address1: z.string().min(1).openapi({ example: "서울시 강남구" }),
        address2: z.string().min(1).openapi({ example: "101동 101호" }),
        gatePassword: z.string().optional().openapi({ example: "#1234" }),
        deliveryRequest: z.string().optional().openapi({ example: "문 앞에 놔주세요" }),
    })
    .openapi("CreateOrderInput");

export const ConfirmPaymentSchema = z
    .object({
        paymentKey: z.string().openapi({ example: "tgen_..." }),
        orderId: z.string().openapi({ example: "order_no_1", description: "주문 DB ID" }),
        amount: z.number().openapi({ example: 50000 }),
    })
    .openapi("ConfirmPaymentInput");

export const OrderParamSchema = z.object({
    id: z.coerce.number().min(1).openapi({ example: 1, description: "주문 ID" }),
});

export const UpdateOrderStatusSchema = z
    .object({
        status: z
            .enum(["CANCELED", "RETURN_REQUESTED"]) // 유저가 요청 가능한 상태만 허용
            .openapi({
                example: "CANCELED",
                description: "변경할 상태 (CANCELED, RETURN_REQUESTED)",
            }),
        reason: z.string().optional().openapi({ example: "단순 변심", description: "사유" }),
    })
    .openapi("UpdateOrderStatusInput");

// --- Output Schemas ---

// 주문 목록용 요약 정보
const OrderSummarySchema = z.object({
    id: z.number(),
    orderNo: z.string().nullable(),
    totalPrice: z.number(),
    status: z.string(),
    createdAt: z.date(),
    itemCount: z.number(),
    representativeProductName: z.string(),
});

// 주문 상세용 상품 정보
const OrderItemDetailSchema = z.object({
    id: z.number(),
    quantity: z.number(),
    price: z.number(),
    product: z.object({
        id: z.number(),
        name: z.string(),
        image: z.string(),
    }),
});

// 주문 상세 전체 정보
export const OrderDetailResponseSchema = z
    .object({
        id: z.number(),
        createdAt: z.date(),
        status: z.string(),
        totalPrice: z.number(),
        recipientName: z.string(),
        recipientPhone: z.string(),
        zipCode: z.string(),
        address1: z.string(),
        address2: z.string(),
        deliveryRequest: z.string().nullable(),
        items: z.array(OrderItemDetailSchema),
        payment: z
            .object({
                method: z.string(),
                amount: z.number(),
            })
            .nullable(),
    })
    .openapi("OrderDetailResponse");

// 페이지네이션 응답
export const PaginatedOrderListSchema = createPaginatedResponseSchema(OrderSummarySchema).openapi(
    "PaginatedOrderListResponse",
);

// --- API Registry ---

registry.registerPath({
    method: "post",
    path: "/orders",
    tags: [TAG],
    summary: "주문 생성 (결제 준비)",
    description: "items 필드가 있으면 '바로 구매', 없으면 '장바구니 구매'로 처리합니다.",
    security: [{ bearerAuth: [] }],
    request: { body: { content: { "application/json": { schema: CreateOrderSchema } } } },
    responses: {
        201: { description: "주문 생성 성공" },
    },
});

registry.registerPath({
    method: "post",
    path: "/orders/confirm",
    tags: [TAG],
    summary: "결제 승인 (토스 연동)",
    security: [{ bearerAuth: [] }],
    request: { body: { content: { "application/json": { schema: ConfirmPaymentSchema } } } },
    responses: { 200: { description: "결제 승인 및 주문 완료" } },
});

registry.registerPath({
    method: "get",
    path: "/orders",
    tags: [TAG],
    summary: "내 주문 목록 조회",
    security: [{ bearerAuth: [] }],
    request: { query: PaginationQuerySchema },
    responses: {
        200: {
            description: "조회 성공",
            content: { "application/json": { schema: PaginatedOrderListSchema } },
        },
    },
});

registry.registerPath({
    method: "get",
    path: "/orders/{id}",
    tags: [TAG],
    summary: "주문 상세 조회",
    security: [{ bearerAuth: [] }],
    request: { params: OrderParamSchema },
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": { schema: z.object({ data: OrderDetailResponseSchema }) },
            },
        },
    },
});

registry.registerPath({
    method: "patch",
    path: "/orders/{id}/status",
    tags: [TAG],
    summary: "주문 상태 변경 (취소/반품)",
    security: [{ bearerAuth: [] }],
    request: {
        params: OrderParamSchema,
        body: { content: { "application/json": { schema: UpdateOrderStatusSchema } } },
    },
    responses: { 200: { description: "상태 변경 성공" } },
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type ConfirmPaymentInput = z.infer<typeof ConfirmPaymentSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
