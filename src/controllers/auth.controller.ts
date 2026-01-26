import { Request, Response, NextFunction } from 'express';
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.register(req.body);

            res.status(201).json({
                message: '회원가입에 성공했습니다.',
                data: user,
            });
        } catch (error: any) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);

            res.status(200).json({
                message: '로그인 성공',
                data: result,
            });
        } catch (error: any) {
            next(error);
        }
    }
}