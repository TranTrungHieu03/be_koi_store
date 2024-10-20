import { Router } from "express";
import {checkVoucher, createVoucher, getAllVouchers} from "../modules/voucher/voucher.controller";

const voucherRoute: Router = Router();

voucherRoute.get("/", getAllVouchers);
voucherRoute.post("/", createVoucher);
voucherRoute.get("/check/:code", checkVoucher)

export default voucherRoute;
