import { NextFunction, Response } from "express";
import { ok } from "../../utils/util";
import { UserService } from "./user.service";
import { AuthRequest } from "../../types/auth-request";
import jwt from "jsonwebtoken";

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allUsers = await UserService.getAllUsers(req, res, next);
    ok(res, "Get all users", allUsers);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.getUserById(req, res, next);
    ok(res, "Get user", user);
  } catch (error) {
    next(error);
  }
};

export const registerStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newUser = await UserService.registerStaff(req);
    ok(res, "Register staff successfully", newUser);
  } catch (error) {
    next(error);
  }
};

export const getAllStaffs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const allStaffs = await UserService.getAllStaffs();
    ok(res, "Get all staffs", allStaffs);
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const staff = await UserService.getStaffById(req);
    ok(res, "Get staff", staff);
  } catch (error) {
    next(error);
  }
};


