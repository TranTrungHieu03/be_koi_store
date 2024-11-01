import {NextFunction, Response} from "express";
import {AuthRequest} from "../../types/auth-request";
import {EsginInfoService} from "./esgin-info.service";
import {badRequest, ok} from "../../utils/util";

export const createEsignInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            status,
            description,
            orderEsignDetailId
        } = req.body;

        const staffId = req?.user?.userId;

        const info = await EsginInfoService.Create({status, description, orderEsignDetailId, staffId: Number(staffId)});

        ok(res, "Create esign info success", info);
    } catch (e) {
        next(e);
    }
}

export const updateEsignInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req?.user?.userId;
        const data = req.body;
        const esignInforId = req.params.esignInforId;
        const isExisting = EsginInfoService.GetOne(Number(esignInforId))
        if (!isExisting) {
            badRequest(res, "Esign Info not found");
            return;
        }

        await EsginInfoService.Update(Number(esignInforId), {...isExisting, ...data, staffId: Number(staffId)})

        ok(res, "Update info success");
    } catch (e) {
        next(e);
    }
}

export const getEsignInfoByOrderDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {orderEsignDetailId} = req.body;
        const data = EsginInfoService.GetByOrderDetailId(Number(orderEsignDetailId));

        ok(res, "Get info success", data)
    } catch (e) {
        next(e);
    }
}

export const getAllEsignByStaffId = async(req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const staffId = req?.user?.userId;
        const data = await EsginInfoService.GetByStaffId(Number(staffId));
        ok(res, "Get info success", data)
    } catch (e) {
        next(e);
    }
}