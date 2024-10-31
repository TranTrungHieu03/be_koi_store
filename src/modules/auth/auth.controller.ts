import { NextFunction, Request, Response } from "express";
import { ok } from "../../utils/util";
import { AuthService } from "./auth.service";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await AuthService.registerUser(req);
    ok(res, "Register user successfully", newUser);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await AuthService.loginUser(req);
    ok(res, "Login user successfully", { user, token });
  } catch (error) {
    next(error);
  }
};

export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = await AuthService.generateToken(req.body);
    ok(res, "Generate token successfully", token);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const user = await AuthService.getCurrentUser(req);
    ok(res, "Get current user success", user)
  } catch (error) {
    next(error);
  }
}
