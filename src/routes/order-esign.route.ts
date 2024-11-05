import {Router} from "express";
import {
    checkPriceCare, checkPriceForNewOrder, confirmCareAfterBuy,
    confirmOrderEsginByCustomer,
    createOrderEsign,
    getAllOrderEsign, getAllOrderEsignByBuyer,
    getOrderEsgin,
    updateEsginDetailByStaff, updateStatusAfterShipping
} from "../modules/order-esign/order-esign.controller";
import {authMiddleware, isStaffOrManager} from "../middleware/auth.middleware";

const orderEsignRoute: Router = Router();

orderEsignRoute.post("/", createOrderEsign); // Tạo đơn e-sign mới
orderEsignRoute.get("/", authMiddleware, getAllOrderEsign); // Lấy tất cả đơn e-sign
orderEsignRoute.get("/buyer", authMiddleware, getAllOrderEsignByBuyer); // Lấy tất cả đơn e-sign của người mua
orderEsignRoute.get("/:orderEsignId", getOrderEsgin); // Lấy thông tin đơn e-sign theo ID

// Kiểm tra giá, xác nhận, cập nhật trạng thái
orderEsignRoute.put("/check-price-new", checkPriceForNewOrder); // Kiểm tra giá mới
orderEsignRoute.put("/:orderEsignId", updateEsginDetailByStaff); // Nhân viên cập nhật thông tin đơn e-sign
orderEsignRoute.put("/confirm/:orderEsignId", authMiddleware, confirmOrderEsginByCustomer); // Khách hàng xác nhận đơn
orderEsignRoute.put("/update/:orderEsignId", authMiddleware, updateStatusAfterShipping); // Cập nhật trạng thái sau khi giao hàng

// Xác nhận sau khi mua
orderEsignRoute.post("/afterBuy/:orderId", authMiddleware, confirmCareAfterBuy);




export default orderEsignRoute;
