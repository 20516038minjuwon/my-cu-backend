import { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/exception.utils";
import { Role } from "@prisma/client";

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    // authenticateJwt를 통과했다면 req.user가 존재함
    const user = req.user;

    if (!user) {
        next(new HttpException(401, '로그인이 필요합니다.'));
        return;
    }

    if (user.role !== Role.ADMIN) {
        next(new HttpException(403, '관리자 권한이 없습니다.'));
        return;
    }

    next();
};
