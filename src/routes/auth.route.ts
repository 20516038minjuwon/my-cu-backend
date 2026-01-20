import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from "../middlewares/auth.middleware";

const authRoute = Router();
const authController = new AuthController();

authRoute.use(authenticateJwt);
authRoute.post('/register', authController.register);
authRoute.post('/login', authController.login);

export default authRoute;