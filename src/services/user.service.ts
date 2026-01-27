import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { UpdateProfileInput, ChangePasswordInput } from "../schemas/user.schema";

export class UserService {
    async getMyProfile(userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "사용자를 찾을 수 없습니다.");

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateProfile(userId: number, data: UpdateProfileInput) {
        if (data.email) {
            const existingUser = await prisma.user.findFirst({
                where: { email: data.email, NOT: { id: userId } },
            });
            if (existingUser) {
                throw new HttpException(409, "이미 사용 중인 이메일입니다.");
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { ...data },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    async changePassword(userId: number, data: ChangePasswordInput) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "사용자를 찾을 수 없습니다.");

        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) {
            throw new HttpException(400, "현재 비밀번호가 일치하지 않습니다.");
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { message: "비밀번호가 성공적으로 변경되었습니다." };
    }
}
