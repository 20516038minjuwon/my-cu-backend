import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import { prisma } from "./prisma";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
    id: number;
    iat: number;
    exp: number;
}

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

export const jwtStrategy = new JwtStrategy(
    opts,
    async (jwt_payload: JwtPayload, done: VerifiedCallback) => {
        try {
            const user: User | null = await prisma.user.findUnique({
                where: { id: jwt_payload.id },
            });

            if (user) {
                const { password, ...userWithoutPassword } = user;
                return done(null, userWithoutPassword);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    },
);
