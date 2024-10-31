import {Router} from "express";
import {
    confirmOrderEsginByCustomer,
    createOrderEsign, getAllOrderEsign,
    getOrderEsgin,
    updateEsginDetailByStaff, updateStatusAfterShipping
} from "../modules/order-esign/order-esign.controller";
import {authMiddleware, isStaffOrManager} from "../middleware/auth.middleware";

const orderEsignRoute: Router = Router();

orderEsignRoute.post("/", createOrderEsign);
orderEsignRoute.get("/", authMiddleware, isStaffOrManager, getAllOrderEsign)
orderEsignRoute.get("/:orderEsignId", getOrderEsgin)
orderEsignRoute.put("/:orderEsignId", updateEsginDetailByStaff);
orderEsignRoute.put("/confirm/:orderEsignId", authMiddleware, confirmOrderEsginByCustomer);
orderEsignRoute.put("/update/:orderEsignId", authMiddleware, updateStatusAfterShipping)


export default orderEsignRoute;
