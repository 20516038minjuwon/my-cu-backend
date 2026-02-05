import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { AddToCartInput, UpdateCartItemInput } from "../schemas/cart.schema";

export class CartService {
    private async getOrCreateCart(userId: number) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }
        return cart;
    }

    async getCart(userId: number) {
        const cart = await this.getOrCreateCart(userId);

        const cartItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: {
                product: {
                    select: { id: true, name: true, price: true, image: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const itemsWithTotal = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: item.product,
            totalPrice: item.product.price * item.quantity,
        }));

        const totalCartPrice = itemsWithTotal.reduce((acc, cur) => acc + cur.totalPrice, 0);

        return {
            cartId: cart.id,
            totalCartPrice,
            items: itemsWithTotal,
        };
    }

    async addToCart(userId: number, data: AddToCartInput) {
        const cart = await this.getOrCreateCart(userId);

        const product = await prisma.product.findUnique({
            where: { id: data.productId },
        });
        if (!product) throw new HttpException(404, "존재하지 않는 상품입니다.");

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: data.productId,
            },
        });

        if (existingItem) {
            return await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + data.quantity },
            });
        } else {
            return await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: data.productId,
                    quantity: data.quantity,
                },
            });
        }
    }

    async updateItemQuantity(userId: number, itemId: number, data: UpdateCartItemInput) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!cartItem) throw new HttpException(404, "장바구니 아이템을 찾을 수 없습니다.");
        if (cartItem.cart.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        return await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: data.quantity },
        });
    }

    async removeCartItem(userId: number, itemId: number) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!cartItem) throw new HttpException(404, "장바구니 아이템을 찾을 수 없습니다.");
        if (cartItem.cart.userId !== userId) throw new HttpException(403, "권한이 없습니다.");

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        return { message: "장바구니에서 삭제되었습니다.", deletedId: itemId };
    }
}
