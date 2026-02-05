import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";
import { AddToCartInput, UpdateCartItemInput } from "../schemas/cart.schema";

const cartService = new CartService();

export class CartController {
    async getCart(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const cart = await cartService.getCart(userId);
            res.status(200).json({ data: cart });
        } catch (error) {
            next(error);
        }
    }

    async addToCart(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const body = req.body as AddToCartInput;

            const result = await cartService.addToCart(userId, body);
            res.status(200).json({ message: "장바구니에 담았습니다.", data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateCartItem(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const params = req.params as unknown as { itemId: string };
            const itemId = Number(params.itemId);

            const body = req.body as UpdateCartItemInput;

            const result = await cartService.updateItemQuantity(userId, itemId, body);
            res.status(200).json({ message: "수량이 변경되었습니다.", data: result });
        } catch (error) {
            next(error);
        }
    }

    async removeCartItem(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as { id: number };
            const userId = Number(user.id);

            const params = req.params as unknown as { itemId: string };
            const itemId = Number(params.itemId);

            const result = await cartService.removeCartItem(userId, itemId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
