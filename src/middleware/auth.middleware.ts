import {NextFunction, Response} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import BadRequestException from "../helpers/errors/bad-request.exception";
import User from "../models/user.model";
import {AuthRequest} from "../types/auth-request";
import {Role} from "../contants/enums";

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new BadRequestException("Invalid token"));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const user = await User.findOne({where: {userId: decoded.id}});
        if (!user) {
            return next(new BadRequestException("User not found"));
        }


        req.user = user;
        next();
    } catch (err: any) {
        if (err?.name === "TokenExpiredError") {
            return next(new BadRequestException("Token has expired"));
        }
        return next(new BadRequestException("Invalid token"));
    }
};

export const isManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== Role.Manager) {
        return next(new BadRequestException("Unauthorized Manager"));
    }
    next();
};

export const isStaffOrManager=async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== Role.Manager && req.user?.role !== Role.Staff) {
        return next(new BadRequestException("Unauthorized. You don't have permission to use this function"));
    }
    next();
};
