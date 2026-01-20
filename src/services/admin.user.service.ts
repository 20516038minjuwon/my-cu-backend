import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";
import { Role } from "@prisma/client";

interface CreateUserDto {
    username: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    birthdate: string;
    role?: Role;
}

interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    birthdate?: string;
    role?: Role;
}

export class AdminUserService {
    async getUsers(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [total, users] = await prisma.$transaction([
            prisma.user.count(),
            prisma.user.findMany({
                skip: skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const sanitizedUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return {
            data: sanitizedUsers,
            pagination: {
                totalUsers: total,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            },
        };
    }

    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async createUser(data: CreateUserDto) {
        const existingUser = await prisma.user.findUnique({
            where: { username: data.username },
        });

        if (existingUser) {
            throw new HttpException(409, "이미 존재하는 사용자ID입니다.");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                name: data.name,
                password: hashedPassword,
                phone: data.phone,
                birthdate: data.birthdate,
                role: data.role || Role.USER,
            },
        });

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async updateUser(userId: number, data: UpdateUserDto) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { ...data },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    async deleteUser(userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new HttpException(404, "해당 회원을 찾을 수 없습니다.");

        await prisma.user.delete({
            where: { id: userId },
        });

        return { message: "회원이 삭제되었습니다.", deletedId: userId };
    }
}
