import {Router} from "express";
import {
    createOrderSale,
    getAllOrderSale,
    getOrderDetailByOrderId,
    getOrdersByUserId, updateStatusOrderDetail, updateTotalOrderSaleStatus
} from "../modules/order-sale/order-sale.controller";
import {authMiddleware, isStaffOrManager} from "../middleware/auth.middleware";
import {checkPriceCare} from "../modules/order-esign/order-esign.controller";
import orderEsignRoute from "./order-esign.route";

const orderSaleRoute: Router = Router();

orderSaleRoute.get("/", getAllOrderSale);
orderSaleRoute.post("/", authMiddleware,createOrderSale);
orderSaleRoute.get("/buyer", authMiddleware, getOrdersByUserId);
orderSaleRoute.get("/:orderSaleId", authMiddleware, getOrderDetailByOrderId);
orderSaleRoute.put("/updateOrder/:orderSaleId", authMiddleware, updateTotalOrderSaleStatus);
orderSaleRoute.put("/updateOrderDetail/:orderSaleDetailId", authMiddleware, updateStatusOrderDetail);
orderSaleRoute.put("/check-price/:orderId", authMiddleware, checkPriceCare)
export default orderSaleRoute;
