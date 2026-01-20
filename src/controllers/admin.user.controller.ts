import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../services/admin.user.service";

const adminUserService = new AdminUserService();

export class AdminUserController {
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;

            const result = await adminUserService.getUsers(page, limit);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id);
            const user = await adminUserService.getUserById(userId);
            res.status(200).json({ data: user });
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await adminUserService.createUser(req.body);
            res.status(201).json({ message: "회원 생성 성공", data: user });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id);
            const user = await adminUserService.updateUser(userId, req.body);
            res.status(200).json({ message: "회원 정보 수정 성공", data: user });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id);
            const result = await adminUserService.deleteUser(userId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}
