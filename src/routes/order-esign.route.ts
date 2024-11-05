import {Router} from "express";
import {
    checkPriceCare,
    confirmOrderEsginByCustomer,
    createOrderEsign, getAllOrderEsign, getAllOrderEsignByBuyer,
    getOrderEsgin,
    updateEsginDetailByStaff, updateStatusAfterShipping
} from "../modules/order-esign/order-esign.controller";
import {authMiddleware, isStaffOrManager} from "../middleware/auth.middleware";

const orderEsignRoute: Router = Router();

orderEsignRoute.post("/", createOrderEsign);
orderEsignRoute.get("/", authMiddleware, getAllOrderEsign)
orderEsignRoute.get("/buyer", authMiddleware, getAllOrderEsignByBuyer)
orderEsignRoute.get("/:orderEsignId", getOrderEsgin)
orderEsignRoute.put("/:orderEsignId", updateEsginDetailByStaff);
orderEsignRoute.put("/confirm/:orderEsignId", authMiddleware, confirmOrderEsginByCustomer);
orderEsignRoute.put("/update/:orderEsignId", authMiddleware, updateStatusAfterShipping)



export default orderEsignRoute;
