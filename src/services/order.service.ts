import axios from "axios";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { PaginationQuery } from "../schemas/common.schema";
import {
    CreateOrderInput,
    ConfirmPaymentInput,
    UpdateOrderStatusInput,
} from "../schemas/order.schema";

export class OrderService {
    // 1. 주문 생성 (바로구매 vs 장바구니구매)
    async createOrder(userId: number, data: CreateOrderInput) {
        let orderItemsData: { productId: number; quantity: number; price: number }[] = [];
        let totalPrice = 0;

        if (data.items && data.items.length > 0) {
            // [바로 구매]
            const productIds = data.items.map(item => item.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
            });

            if (products.length !== data.items.length) {
                throw new HttpException(400, "존재하지 않는 상품이 포함되어 있습니다.");
            }

            const productMap = new Map(products.map(p => [p.id, p]));

            for (const item of data.items) {
                const product = productMap.get(item.productId);
                if (!product) continue;

                const itemPrice = product.price * item.quantity;
                totalPrice += itemPrice;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                });
            }
        } else {
            // [장바구니 구매]
            const cart = await prisma.cart.findUnique({
                where: { userId },
                include: { items: { include: { product: true } } },
            });

            if (!cart || cart.items.length === 0) {
                throw new HttpException(400, "장바구니가 비어있어 주문을 생성할 수 없습니다.");
            }

            for (const item of cart.items) {
                const itemPrice = item.product.price * item.quantity;
                totalPrice += itemPrice;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                });
            }
        }

        const order = await prisma.order.create({
            data: {
                userId,
                recipientName: data.recipientName,
                recipientPhone: data.recipientPhone,
                zipCode: data.zipCode,
                address1: data.address1,
                address2: data.address2,
                gatePassword: data.gatePassword,
                deliveryRequest: data.deliveryRequest,
                totalPrice,
                status: "PENDING",
                items: {
                    create: orderItemsData,
                },
            },
            include: { items: true },
        });

        return { ...order, orderNo: String(order.id) };
    }

    // 2. 결제 승인 (토스 API 연동 + 스마트 장바구니 정리)
    async confirmPayment(userId: number, data: ConfirmPaymentInput) {
        const orderId = Number(data.orderId);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) throw new HttpException(404, "주문 정보를 찾을 수 없습니다.");
        if (order.userId !== userId) throw new HttpException(403, "권한이 없습니다.");
        if (order.totalPrice !== data.amount)
            throw new HttpException(400, "주문 금액이 일치하지 않습니다.");
        if (order.status !== "PENDING") throw new HttpException(400, "이미 처리된 주문입니다.");

        // 토스 결제 승인 API 호출
        const widgetSecretKey = process.env.TOSS_SECRET_KEY;
        const encryptedSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

        try {
            const response = await axios.post(
                "https://api.tosspayments.com/v1/payments/confirm",
                {
                    paymentKey: data.paymentKey,
                    orderId: data.orderId,
                    amount: data.amount,
                },
                { headers: { Authorization: encryptedSecretKey } },
            );

            const paymentData = response.data;

            // 트랜잭션 처리
            await prisma.$transaction(async tx => {
                await tx.payment.create({
                    data: {
                        orderId: order.id,
                        method: paymentData.method,
                        amount: paymentData.totalAmount,
                        status: "PAID",
                        approvedAt: new Date(paymentData.approvedAt),
                    },
                });

                await tx.order.update({
                    where: { id: order.id },
                    data: { status: "PAID" },
                });

                // [중요] 구매한 상품만 장바구니에서 제거
                const cart = await tx.cart.findUnique({ where: { userId } });
                if (cart) {
                    const purchasedProductIds = order.items.map(item => item.productId);
                    await tx.cartItem.deleteMany({
                        where: {
                            cartId: cart.id,
                            productId: { in: purchasedProductIds },
                        },
                    });
                }
            });

            return { message: "주문이 완료되었습니다.", orderId: order.id };
        } catch (error: any) {
            const tossMessage = error.response?.data?.message || "알 수 없는 오류";
            throw new HttpException(400, `결제 승인 실패: ${tossMessage}`);
        }
    }

    // 3. 주문 목록 조회 (페이지네이션)
    async getOrders(userId: number, query: PaginationQuery) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const totalItems = await prisma.order.count({ where: { userId } });

        const orders = await prisma.order.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { items: { include: { product: true } } },
        });

        const data = orders.map(order => {
            const firstItemName = order.items[0]?.product.name || "상품 정보 없음";
            const otherCount = order.items.length - 1;
            const representativeProductName =
                otherCount > 0 ? `${firstItemName} 외 ${otherCount}건` : firstItemName;

            return {
                id: order.id,
                orderNo: String(order.id),
                totalPrice: order.totalPrice,
                status: order.status,
                createdAt: order.createdAt,
                itemCount: order.items.length,
                representativeProductName,
            };
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    }

    // 4. 주문 상세 조회
    async getOrderById(userId: number, orderId: number) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                payment: true,
            },
        });

        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");
        if (order.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        return order;
    }

    // 5. 주문 상태 변경 (취소/반품)
    async updateOrderStatus(userId: number, orderId: number, body: UpdateOrderStatusInput) {
        const order = await prisma.order.findUnique({ where: { id: orderId } });

        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");
        if (order.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        const { status: currentStatus } = order;
        const { status: targetStatus } = body;

        if (targetStatus === "CANCELED") {
            if (currentStatus !== "PENDING" && currentStatus !== "PAID") {
                throw new HttpException(
                    400,
                    "배송 준비 중이거나 배송된 상품은 취소할 수 없습니다.",
                );
            }
        } else if (targetStatus === "RETURN_REQUESTED") {
            if (currentStatus !== "DELIVERED") {
                throw new HttpException(400, "배송이 완료된 상품만 반품 신청이 가능합니다.");
            }
        } else {
            throw new HttpException(400, "잘못된 상태 변경 요청입니다.");
        }

        return await prisma.order.update({
            where: { id: orderId },
            data: { status: targetStatus },
        });
    }
}
