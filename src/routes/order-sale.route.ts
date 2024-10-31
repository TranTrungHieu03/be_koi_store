import {Router} from "express";
import {
    createOrderSale,
    getAllOrderSale,
    getOrderDetailByOrderId,
    getOrdersByUserId, updateStatusOrderDetail, updateTotalOrderSaleStatus
} from "../modules/order-sale/order-sale.controller";
import {authMiddleware, isStaffOrManager} from "../middleware/auth.middleware";

const orderSaleRoute: Router = Router();

orderSaleRoute.get("/", getAllOrderSale);
orderSaleRoute.post("/", authMiddleware,createOrderSale);
orderSaleRoute.get("/buyer", authMiddleware, getOrdersByUserId);
orderSaleRoute.get("/:orderSaleId", authMiddleware, getOrderDetailByOrderId);
orderSaleRoute.put("/updateOrder/:orderSaleId", authMiddleware, updateTotalOrderSaleStatus);
orderSaleRoute.put("/updateOrderDetail/:orderSaleDetailId", authMiddleware, updateStatusOrderDetail);
export default orderSaleRoute;
