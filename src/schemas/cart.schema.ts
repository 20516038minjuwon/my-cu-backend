import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "../config/openApi";

extendZodWithOpenApi(z);

const TAG = "Cart";

export const AddToCartSchema = z
    .object({
        productId: z.number().min(1, "상품 ID는 필수입니다.").openapi({ example: 1 }),
        quantity: z
            .number()
            .min(1, "수량은 1개 이상이어야 합니다.")
            .default(1)
            .openapi({ example: 2 }),
    })
    .openapi("AddToCartInput");

export const UpdateCartItemSchema = z
    .object({
        quantity: z.number().min(1, "수량은 1개 이상이어야 합니다.").openapi({ example: 5 }),
    })
    .openapi("UpdateCartItemInput");

export const CartItemParamSchema = z.object({
    itemId: z.coerce
        .number()
        .min(1)
        .openapi({ example: 1, description: "장바구니 아이템 ID (CartItem.id)" }),
});

const CartProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    image: z.string(),
});

const CartItemResponseSchema = z.object({
    id: z.number(),
    quantity: z.number(),
    product: CartProductSchema,
    totalPrice: z.number().openapi({ description: "상품 가격 * 수량" }), // 계산된 필드
});

export const CartResponseSchema = z
    .object({
        cartId: z.number(),
        totalCartPrice: z.number().openapi({ description: "장바구니 전체 총액" }),
        items: z.array(CartItemResponseSchema),
    })
    .openapi("CartResponse");

registry.registerPath({
    method: "get",
    path: "/cart",
    tags: [TAG],
    summary: "장바구니 조회",
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: "조회 성공",
            content: {
                "application/json": { schema: z.object({ data: CartResponseSchema }) },
            },
        },
    },
});

registry.registerPath({
    method: "post",
    path: "/cart/items",
    tags: [TAG],
    summary: "장바구니 상품 추가",
    description: "이미 장바구니에 있는 상품이면 수량을 증가시킵니다.",
    security: [{ bearerAuth: [] }],
    request: {
        body: { content: { "application/json": { schema: AddToCartSchema } } },
    },
    responses: {
        200: { description: "추가 성공" },
        404: { description: "상품이 존재하지 않음" },
    },
});

registry.registerPath({
    method: "patch",
    path: "/cart/items/{itemId}",
    tags: [TAG],
    summary: "장바구니 아이템 수량 변경",
    security: [{ bearerAuth: [] }],
    request: {
        params: CartItemParamSchema,
        body: { content: { "application/json": { schema: UpdateCartItemSchema } } },
    },
    responses: {
        200: { description: "수정 성공" },
        404: { description: "장바구니 아이템을 찾을 수 없음" },
    },
});

registry.registerPath({
    method: "delete",
    path: "/cart/items/{itemId}",
    tags: [TAG],
    summary: "장바구니 아이템 삭제",
    security: [{ bearerAuth: [] }],
    request: {
        params: CartItemParamSchema,
    },
    responses: {
        200: { description: "삭제 성공" },
    },
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
