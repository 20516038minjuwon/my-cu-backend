import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../services/admin.user.service";
import { PaginationQuery, UserIdParam } from "../schemas/admin.user.schema";

const adminUserService = new AdminUserService();

export class AdminUserController {
    async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = req.query as unknown as PaginationQuery;

            const result = await adminUserService.getUsers(page, limit);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as unknown as UserIdParam;

            const user = await adminUserService.getUserById(id);
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
            const { id } = req.params as unknown as UserIdParam;
            const user = await adminUserService.updateUser(id, req.body);
            res.status(200).json({ message: "회원 정보 수정 성공", data: user });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params as unknown as UserIdParam;
            const result = await adminUserService.deleteUser(id);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}