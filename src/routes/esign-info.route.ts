import {Router} from "express";
import {
    createEsignInfo,
    getAllEsignByStaffId,
    getEsignInfoByOrderDetail
} from "../modules/esign-info/esign-info.controller";
import {authMiddleware, isStaffOrManager} from "../middleware/auth.middleware";


const esignInforoute: Router = Router();

esignInforoute.get("/", authMiddleware, getAllEsignByStaffId);
esignInforoute.get("/:orderEsignDetailId", authMiddleware, getEsignInfoByOrderDetail);
esignInforoute.post("/", authMiddleware, isStaffOrManager, createEsignInfo);


export default esignInforoute;
