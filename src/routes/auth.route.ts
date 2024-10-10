import { Router } from "express";
import { loginUser, registerUser } from "../modules/auth/auth.controller";

const authRoutes: Router = Router();

authRoutes.post("/register-user", registerUser);
authRoutes.post("/login-user", loginUser);

export default authRoutes;
