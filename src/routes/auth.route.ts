import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema";

const authRoute = Router();
const authController = new AuthController();

authRoute.post("/register", validateBody(RegisterSchema), authController.register);
authRoute.post("/login", validateBody(LoginSchema), authController.login);

export default authRoute;
