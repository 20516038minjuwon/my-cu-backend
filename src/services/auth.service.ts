import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from "../config/prisma";
import { HttpException } from "../utils/exception.utils";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface RegisterParams {
    username: string;
    name: string;
    email: string;
    phone: string;
    birthdate: string;
    password: string;
    password_confirm: string;
}

interface LoginParams {
    username: string;
    password: string;
}

export class AuthService {
    async register(data: RegisterParams) {
        const { username, email, password, password_confirm, name, phone, birthdate } = data;

        if (password !== password_confirm) {
            throw new HttpException(400, "비밀번호가 일치하지 않습니다.")
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ username}, { email}] },
        });

        if (existingUser) {
            throw new HttpException(409, "이미 존재하는 이메일입니다.")
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                name,
                phone,
                birthdate,
                role: Role.USER,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async login(data: LoginParams) {
        const { username, password } = data;

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new HttpException(405, "아이디나 비밀번호가 일치하지 않습니다.")
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpException(405, "아이디나 비밀번호가 일치하지 않습니다.")
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }
}