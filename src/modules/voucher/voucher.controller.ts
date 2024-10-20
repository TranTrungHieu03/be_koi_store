import {NextFunction, Request, Response} from "express";
import ResponseDTO from "../../helpers/response";
import {VoucherService} from "./voucher.service";
import {badRequest, created, internalServerError, ok} from "../../utils/util";
import  {VoucherCreationAttributes} from "../../models/voucher.model";
import {formatDate} from "../../utils/formatDate";

export const getAllVouchers = async (req: Request, res: Response, next: NextFunction) => {
    const allVouchers = await VoucherService.getAllVouchers();
    res.status(200).json(ResponseDTO("Get all Vouchers", allVouchers));
};

export const checkVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const voucher = await VoucherService.findByCode(req.params.code);
        if (!voucher) {
            badRequest(res, "Voucher not found");
            return
        }
        if (Date.now() < voucher.startDate.getTime()) {
            badRequest(res, `Voucher must be use after ${formatDate(voucher.startDate)}`)
            return
        }
        if (Date.now() > voucher.endDate.getTime()) {
            badRequest(res, `Voucher is expired, after ${formatDate(voucher.endDate)}`)
            return
        }
        if (voucher.remainQuantity === 0) {
            badRequest(res, `Voucher has been fully used`)
            return
        }
        ok(res, "OK", voucher)
    } catch (e) {
        next(e)
    }
}

export const createVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body as VoucherCreationAttributes
        if (!data.endDate || !data.startDate || !data.rate || !data.description || !data.name || !data.initQuantity) {
            badRequest(res, "Please enter full information")
            return
        }
        const existingVoucherCode = await VoucherService.findByCode(data.code);
        if (existingVoucherCode) {
            badRequest(res, "Voucher code has been exist", data);
        }

        const voucher = await VoucherService.create({...data, remainQuantity: data.initQuantity})

        if (!voucher) {
            internalServerError(res, "Create voucher failed")
            return
        }
        created(res, "Created Ok", voucher)
    } catch (e) {
        next(e)
    }
}