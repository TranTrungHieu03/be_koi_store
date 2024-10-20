import { Router } from "express";
import {autoCreateFee} from "../modules/fee/fee.controller";


const feeRoute: Router = Router();

feeRoute.get("/", autoCreateFee);

export default feeRoute;
