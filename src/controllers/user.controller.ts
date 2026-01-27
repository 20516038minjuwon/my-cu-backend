import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const user = await userService.getMyProfile(userId);
            res.status(200).json({ data: user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const updatedUser = await userService.updateProfile(userId, req.body);
            res.status(200).json({
                message: "회원 정보가 수정되었습니다.",
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const result = await userService.changePassword(userId, req.body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}