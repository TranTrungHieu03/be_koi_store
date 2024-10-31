import { Router } from "express";
import {getCurrentUser, loginUser, registerUser} from "../modules/auth/auth.controller";

const authRoutes: Router = Router();

authRoutes.post("/register-user", registerUser);
authRoutes.post("/login-user", loginUser);
authRoutes.get("/get-user", getCurrentUser);
export default authRoutes;
