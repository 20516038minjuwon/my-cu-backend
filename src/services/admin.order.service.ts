import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { Prisma } from "@prisma/client";
import { AdminOrderListQuery, AdminUpdateOrderInput } from "../schemas/admin.order.schema";

export class AdminOrderService {
    // 1. 전체 주문 목록 (필터링 + 페이지네이션)
    async getOrders(query: AdminOrderListQuery) {
        const { page, limit, status, search } = query;
        const skip = (page - 1) * limit;

        // 검색 조건 구성
        const where: Prisma.OrderWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { recipientName: { contains: search } }, // 수령인 이름
                { user: { username: { contains: search } } }, // 주문자 아이디
                { user: { name: { contains: search } } }, // 주문자 실명
            ];
            // 만약 search가 숫자라면 주문번호(ID) 검색도 포함
            if (!isNaN(Number(search))) {
                where.OR.push({ id: Number(search) });
            }
        }

        // 데이터 조회
        const [totalItems, orders] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { username: true } }, // 주문자 ID 가져오기
                    items: { include: { product: true } },
                },
            }),
        ]);

        // 응답 데이터 가공
        const data = orders.map(order => {
            const firstItemName = order.items[0]?.product.name || "삭제된 상품";
            const otherCount = order.items.length - 1;
            const itemsSummary =
                otherCount > 0 ? `${firstItemName} 외 ${otherCount}건` : firstItemName;

            return {
                id: order.id,
                orderNo: String(order.id),
                totalPrice: order.totalPrice,
                status: order.status,
                createdAt: order.createdAt,
                recipientName: order.recipientName,
                username: order.user.username,
                itemsSummary,
            };
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            data,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        };
    }

    // 2. 상세 조회
    async getOrderById(id: number) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, username: true, name: true, email: true } },
                items: { include: { product: true } },
                payment: true,
            },
        });

        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");

        return order;
    }

    // 3. 상태 수정 (운송장 입력 포함)
    async updateOrderStatus(id: number, data: AdminUpdateOrderInput) {
        const order = await prisma.order.findUnique({ where: { id } });
        if (!order) throw new HttpException(404, "주문을 찾을 수 없습니다.");

        // 배송 처리(SHIPPED)인 경우 운송장 정보 업데이트
        // 만약 'SHIPPED' 상태인데 운송장이 없으면 에러를 낼 수도 있고, 나중에 넣게 할 수도 있음 (여기선 유연하게 처리)

        return await prisma.order.update({
            where: { id },
            data: {
                status: data.status,
                trackingNumber: data.trackingNumber || order.trackingNumber, // 입력값이 없으면 기존값 유지
                carrier: data.carrier || order.carrier,
            },
        });
    }
}
